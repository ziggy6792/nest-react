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
