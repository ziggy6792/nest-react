import type { QueryClient } from '@tanstack/react-query';
import type { AppRoute, AppRouter } from '@ts-rest/core';

/**
 * Extracts the second argument type from a useQuery hook.
 * useQuery signature: (queryKey, args?, options?) => UseQueryResult
 */
type ExtractQueryArg<THook> = THook extends {
  useQuery: (...args: any[]) => any;
}
  ? Parameters<THook['useQuery']>[1]
  : never;

/**
 * Type-safe wrapper that combines a query key function with a useQuery hook.
 * Eliminates the need to pass queryKey and args separately.
 *
 * @param queryKeyFn - Function that generates the query key from args
 * @param hook - The useQuery hook to wrap
 * @returns A new function that only requires args, automatically passing the query key
 *
 * @example
 * // Before:
 * const q = users.hooks.byId.useQuery(users.utils.byId.queryKey(args), args);
 *
 * // After:
 * const q = withKey(users.utils.byId.queryKey, users.hooks.byId.useQuery)(args);
 */
export function withKey<TArgs, TResult>(
  queryKeyFn: (args?: TArgs) => readonly unknown[],
  hook: (queryKey: readonly unknown[], args: TArgs, options?: any) => TResult
): (args: TArgs, options?: any) => TResult {
  return (args, options) => {
    const queryKey = queryKeyFn(args);
    return hook(queryKey, args, options);
  };
}

/**
 * Type utility that wraps hooks structure to automatically inject query keys.
 * Transforms useQuery(queryKey, args) into useQuery(args).
 *
 * For ts-rest hooks, useQuery has the signature:
 * <TData = DefaultData>(queryKey: QueryKey, args: TArgs, options?: Options) => UseQueryResult<TData>
 *
 * We transform it to:
 * <TData = DefaultData>(args: TArgs, options?: Options) => UseQueryResult<TData>
 */
export type WrappedHooksForRouter<TRouter extends AppRouter, THooks extends Record<string, any>, TUtils extends Record<string, any>> = {
  [K in keyof TRouter]: K extends string
    ? TRouter[K] extends { method: 'GET' | 'HEAD' }
      ? THooks[K] extends Record<string, any>
        ? Omit<THooks[K], 'useQuery'> & {
            useQuery: THooks[K] extends { useQuery: infer TUseQuery }
              ? TUseQuery extends <TData = any>(queryKey: any, args: infer TArgs, options?: infer TOptions) => infer TReturn
                ? <TData = any>(args: TArgs, options?: TOptions) => TReturn
                : TUseQuery
              : never;
          }
        : THooks[K]
      : TRouter[K] extends AppRouter
        ? WrappedHooksForRouter<TRouter[K], THooks[K] extends Record<string, any> ? THooks[K] : {}, TUtils[K] extends Record<string, any> ? TUtils[K] : {}>
        : THooks[K]
    : never;
};

/**
 * Wraps hooks with automatic query key injection.
 * Transforms hooks so useQuery(args) automatically includes the query key.
 *
 * @param router - The ts-rest router contract
 * @param hooks - The original hooks from initQueryClient
 * @param utils - The utils object containing query key functions
 * @returns Wrapped hooks with automatic query key injection
 *
 * @example
 * const wrappedHooks = wrapHooks(usersContract, usersHooks, utils);
 * // Now you can use: wrappedHooks.byId.useQuery(args) instead of useQuery(queryKey, args)
 */
export function wrapHooks<TRouter extends AppRouter, THooks extends Record<string, any>, TUtils extends Record<string, any>>(
  router: TRouter,
  hooks: THooks,
  utils: TUtils
): WrappedHooksForRouter<TRouter, THooks, TUtils> {
  const wrapped: any = {};

  for (const key of Object.keys(router)) {
    const routerNode = router[key];
    const hooksNode = hooks[key];
    const utilsNode = utils[key];

    if (isRoute(routerNode)) {
      const method = routerNode.method as string;
      const isQuery = isQueryMethod(method);

      if (isQuery && hooksNode && typeof hooksNode === 'object' && 'useQuery' in hooksNode) {
        // Wrap the useQuery hook to automatically inject query key
        const originalUseQuery = hooksNode.useQuery;
        const queryKeyFn = utilsNode?.queryKey;

        // Create wrapper function that matches the original signature minus the queryKey param
        function wrappedUseQuery(this: any, ...argsAndOptions: any[]) {
          const [args, options] = argsAndOptions;
          const queryKey = queryKeyFn ? queryKeyFn(args) : [key, args];
          return originalUseQuery.call(this, queryKey, args, options);
        }

        wrapped[key] = {
          ...hooksNode,
          useQuery: wrappedUseQuery,
        };
      } else {
        // For non-query routes (mutations), keep as-is
        wrapped[key] = hooksNode;
      }
    } else if (routerNode && typeof routerNode === 'object' && !isRoute(routerNode)) {
      // Nested router - recurse
      wrapped[key] = wrapHooks(routerNode as AppRouter, hooksNode || {}, utilsNode || {});
    } else {
      wrapped[key] = hooksNode;
    }
  }

  return wrapped;
}

/**
 * Type utility that maps router structure to typed utils structure.
 * For GET/HEAD routes: adds queryKey, invalidate, prefetch, setData
 * For mutations: adds fetch
 * Recursively handles nested routers.
 */
export type UtilsForRouter<TRouter extends AppRouter, THooks extends Record<string, any>, TClient extends Record<string, any>> = {
  [K in keyof TRouter]: K extends string
    ? TRouter[K] extends { method: 'GET' | 'HEAD' }
      ? THooks[K] extends Record<string, any>
        ? {
            queryKey: (args?: ExtractQueryArg<THooks[K]>) => readonly unknown[];
            invalidate: (args?: ExtractQueryArg<THooks[K]>) => void;
            prefetch: (args?: ExtractQueryArg<THooks[K]>) => Promise<void>;
            setData: (argsOrUpdater: ExtractQueryArg<THooks[K]> | ((prev: any) => any), updater?: (prev: any) => any) => void;
          }
        : never
      : TRouter[K] extends AppRoute
        ? {
            fetch: (args?: unknown) => Promise<unknown>;
          }
        : TRouter[K] extends AppRouter
          ? UtilsForRouter<TRouter[K], THooks[K] extends Record<string, any> ? THooks[K] : {}, TClient[K] extends Record<string, any> ? TClient[K] : {}>
          : never
    : never;
};

/**
 * Builds a stable query key from router path and route name.
 * Keys are auto-generated from the router structure.
 */
function buildQueryKey(routerName: string, routeName: string, args?: unknown): readonly unknown[] {
  const base = [routerName, routeName] as const;

  if (!args) return base;

  // For routes with params, include param values in key
  try {
    const plain = typeof args === 'object' && args !== null ? JSON.parse(JSON.stringify(args)) : args;

    // Extract path params if present
    if (plain && typeof plain === 'object' && 'params' in plain) {
      const params = (plain as { params?: Record<string, unknown> }).params;
      if (params) {
        // Include param values in key for stable caching
        const paramValues = Object.values(params);
        return [...base, ...paramValues] as const;
      }
    }

    return base;
  } catch {
    return base;
  }
}

/**
 * Checks if a contract node is a route (has a method property).
 */
function isRoute(node: unknown): node is AppRoute {
  return typeof node === 'object' && node !== null && 'method' in node && typeof (node as { method: unknown }).method === 'string';
}

/**
 * Checks if a method is a query (GET or HEAD).
 */
function isQueryMethod(method: string): boolean {
  const upper = method.toUpperCase();
  return upper === 'GET' || upper === 'HEAD';
}

/**
 * Extracts router name from router object (first key in the router).
 * Falls back to a default if structure is unexpected.
 */
function getRouterName(router: AppRouter): string {
  const keys = Object.keys(router);
  if (keys.length > 0) {
    // Use first route name as base, or derive from structure
    return keys[0];
  }
  return 'api';
}

/**
 * Generic factory that auto-generates cache utils from any ts-rest router.
 * Returns fully typed utils matching the router structure with auto-generated keys.
 */
export function createUtils<TRouter extends AppRouter, THooks extends Record<string, any>, TClient extends Record<string, any>>(
  router: TRouter,
  hooks: THooks,
  client: TClient,
  qc: QueryClient,
  routerName?: string,
  path: string[] = []
): UtilsForRouter<TRouter, THooks, TClient> {
  const baseRouterName = routerName || getRouterName(router);
  const out: any = {};

  for (const key of Object.keys(router)) {
    const routerNode = router[key];
    const hooksNode = hooks[key];
    const clientNode = client[key];

    if (isRoute(routerNode)) {
      const method = routerNode.method as string;
      const isQuery = isQueryMethod(method);

      if (isQuery) {
        // Auto-generate query key function
        const queryKey = (args?: unknown) => buildQueryKey(baseRouterName, key, args);

        // Auto-generate invalidate
        out[key] = {
          queryKey,
          invalidate: (args?: unknown) => {
            const key = queryKey(args);
            return qc.invalidateQueries({ queryKey: key });
          },
          prefetch: async (args?: unknown) => {
            const key = queryKey(args);
            const clientFn = clientNode as (args?: any) => Promise<any>;
            return qc.prefetchQuery({
              queryKey: key,
              queryFn: async () => {
                const res = await clientFn(args);
                return res?.body ?? res;
              },
            });
          },
          setData: (argsOrUpdater: unknown, updater?: unknown) => {
            const hasArgs = updater !== undefined;
            const key = queryKey(hasArgs ? argsOrUpdater : undefined);
            const updaterFn = hasArgs ? updater : argsOrUpdater;
            qc.setQueryData(key, updaterFn);
          },
        };
      } else {
        // For mutations, just provide fetch helper
        out[key] = {
          fetch: async (args?: unknown) => {
            const clientFn = clientNode as (args?: any) => Promise<any>;
            const res = await clientFn(args);
            return res;
          },
        };
      }
    } else if (routerNode && typeof routerNode === 'object' && !isRoute(routerNode)) {
      // Nested router - recurse
      out[key] = createUtils(routerNode as AppRouter, hooksNode || {}, clientNode || {}, qc, baseRouterName, [...path, key]);
    }
  }

  return out;
}
