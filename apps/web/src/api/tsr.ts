import { createORPCClient } from '@orpc/client';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { usersContract } from '@contract/users.contract';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

/**
 * Fetches the OpenAPI schema from the server and extracts Date fields
 */
async function buildDateFieldMapFromOpenAPI(): Promise<Map<string, Set<string>>> {
  const dateFieldMap = new Map<string, Set<string>>();

  try {
    // Fetch the OpenAPI spec from the server
    const response = await fetch(`${API_BASE}/swagger/json`);
    const openApiSpec = await response.json();

    // Traverse OpenAPI paths to find Date fields
    if (openApiSpec.paths) {
      for (const [path, methods] of Object.entries(openApiSpec.paths)) {
        const pathMethods = methods as Record<string, unknown>;

        for (const [method, operation] of Object.entries(pathMethods)) {
          if (method.toLowerCase() === 'get' || method.toLowerCase() === 'post') {
            const op = operation as Record<string, unknown>;

            // Get response schema
            if (op.responses && typeof op.responses === 'object') {
              const responses = op.responses as Record<string, unknown>;

              // Check 200 response
              if ('200' in responses) {
                const response200 = responses['200'] as Record<string, unknown>;
                if (response200.content && typeof response200.content === 'object') {
                  const content = response200.content as Record<string, unknown>;

                  // Check application/json
                  if ('application/json' in content) {
                    const jsonContent = content['application/json'] as Record<string, unknown>;
                    if (jsonContent.schema) {
                      const schema = jsonContent.schema as Record<string, unknown>;
                      const dateFields = extractDateFieldsFromOpenAPISchema(schema);

                      // Convert path to route format (e.g., /api/users -> users.list)
                      const routePath = convertPathToRoutePath(path, method.toLowerCase());
                      if (dateFields.size > 0) {
                        dateFieldMap.set(routePath, dateFields);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn('Failed to fetch OpenAPI spec, falling back to runtime detection:', error);
  }

  return dateFieldMap;
}

/**
 * Converts OpenAPI path to route path format
 */
function convertPathToRoutePath(path: string, method: string): string {
  // Remove /api prefix if present
  const routePath = path.replace(/^\/api\//, '').replace(/^\//, '');

  // Convert path segments to route format
  // e.g., /users/list -> users.list, /users/{id} -> users.byId, /users -> users.list
  const segments = routePath.split('/').filter(Boolean);

  if (segments.length === 1) {
    // Single segment: /users -> users.list or users.add
    return `${segments[0]}.${method === 'get' ? 'list' : 'add'}`;
  } else if (segments.length === 2) {
    if (segments[1].startsWith('{')) {
      // Path with param: /users/{id} -> users.byId
      return `${segments[0]}.byId`;
    } else {
      // Two segments: /users/list -> users.list, /users/add -> users.add
      return `${segments[0]}.${segments[1]}`;
    }
  }

  // Fallback: join segments with dots
  return segments.join('.');
}

/**
 * Extracts Date fields from OpenAPI schema
 */
function extractDateFieldsFromOpenAPISchema(schema: Record<string, unknown>, prefix = ''): Set<string> {
  const dateFields = new Set<string>();

  // Check if this schema has format: "date-time" (indicates Date type)
  if (schema.format === 'date-time' || schema.format === 'date') {
    if (prefix) dateFields.add(prefix);
    return dateFields;
  }

  // Handle array schemas
  if (schema.type === 'array' && schema.items) {
    const items = schema.items as Record<string, unknown>;
    return extractDateFieldsFromOpenAPISchema(items, prefix);
  }

  // Handle object schemas
  if (schema.type === 'object' && schema.properties) {
    const properties = schema.properties as Record<string, unknown>;

    for (const [key, propSchema] of Object.entries(properties)) {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      const prop = propSchema as Record<string, unknown>;

      // Check if property is a date
      if (prop.format === 'date-time' || prop.format === 'date') {
        dateFields.add(fieldPath);
      }
      // Recursively check nested objects
      else if (prop.type === 'object' && prop.properties) {
        const nestedFields = extractDateFieldsFromOpenAPISchema(prop, fieldPath);
        nestedFields.forEach((f) => dateFields.add(f));
      }
      // Handle array of objects
      else if (prop.type === 'array' && prop.items) {
        const items = prop.items as Record<string, unknown>;
        if (items.type === 'object') {
          const nestedFields = extractDateFieldsFromOpenAPISchema(items, fieldPath);
          nestedFields.forEach((f) => dateFields.add(f));
        }
      }
    }
  }

  return dateFields;
}

/**
 * Checks if a string is an ISO date string
 */
function isISODateString(value: string): boolean {
  // ISO 8601 date pattern: YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DDTHH:mm:ssZ
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  return isoDateRegex.test(value);
}

/**
 * Transforms date strings to Date objects based on the field map from contract schema
 */
function transformDates<T>(data: T, dateFields: Set<string>, currentPath = ''): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => transformDates(item, dateFields, currentPath)) as T;
  }

  if (typeof data === 'object') {
    const transformed = {} as T;
    for (const [key, value] of Object.entries(data)) {
      const fieldPath = currentPath ? `${currentPath}.${key}` : key;

      // Check if this field should be a Date (from contract schema inspection)
      const shouldBeDate = dateFields.has(fieldPath) || dateFields.has(key);

      if (shouldBeDate && typeof value === 'string' && isISODateString(value)) {
        // Convert ISO date string to Date object
        (transformed as Record<string, unknown>)[key] = new Date(value);
      } else if (typeof value === 'object' && value !== null) {
        // Recursively transform nested objects
        (transformed as Record<string, unknown>)[key] = transformDates(value, dateFields, fieldPath);
      } else {
        (transformed as Record<string, unknown>)[key] = value;
      }
    }
    return transformed;
  }

  return data;
}

// Build the date field map from OpenAPI schema (async)
let dateFieldMap = new Map<string, Set<string>>();

// Initialize date field map from OpenAPI
buildDateFieldMapFromOpenAPI()
  .then((map) => {
    dateFieldMap = map;
    const mapObj = Object.fromEntries(Array.from(map.entries()).map(([k, v]) => [k, Array.from(v)]));
    console.log('Date field map loaded from OpenAPI:', mapObj);
    if (Object.keys(mapObj).length === 0) {
      console.warn('No date fields found in OpenAPI schema - dates will not be transformed');
    }
  })
  .catch((error) => {
    console.warn('Failed to load date field map from OpenAPI:', error);
  });

const link = new OpenAPILink(usersContract, {
  url: API_BASE,
});

const baseClient = createORPCClient(link);

const baseOrpc = createTanstackQueryUtils(baseClient);

/**
 * Recursively wraps the ORPC utils to transform date strings based on contract schema
 */
function wrapOrpcWithDateTransformation(orpcUtils: unknown, routePath: string[] = []): unknown {
  return new Proxy(orpcUtils as object, {
    get(target, prop) {
      const value = (target as Record<string | symbol, unknown>)[prop];
      const newPath = [...routePath, String(prop)];
      const pathKey = newPath.join('.');

      // If it's a function, check if it's queryOptions or mutationOptions
      if (typeof value === 'function') {
        const propName = String(prop);
        if (propName === 'queryOptions' || propName === 'mutationOptions') {
          return (...args: unknown[]) => {
            // Call the function directly
            const options = (value as (...args: unknown[]) => unknown)(...args);
            if (options && typeof options === 'object') {
              const optionsObj = options as Record<string, unknown>;
              const fnKey = propName === 'queryOptions' ? 'queryFn' : 'mutationFn';

              if (fnKey in optionsObj && typeof optionsObj[fnKey] === 'function') {
                const originalFn = optionsObj[fnKey] as (...args: unknown[]) => Promise<unknown>;
                optionsObj[fnKey] = async (...fnArgs: unknown[]) => {
                  const result = await originalFn(...fnArgs);
                  // Remove .queryOptions or .mutationOptions from path to get the route path
                  const routePath = pathKey.replace(/\.(queryOptions|mutationOptions)$/, '');
                  const dateFields = dateFieldMap.get(routePath) || new Set<string>();
                  return transformDates(result, dateFields);
                };
              }
            }
            return options;
          };
        }
        return value;
      }

      // If it's an object (like nested routes), recursively wrap it
      if (value && typeof value === 'object' && value !== null) {
        return wrapOrpcWithDateTransformation(value, newPath);
      }

      return value;
    },
  });
}

export const orpc = wrapOrpcWithDateTransformation(baseOrpc) as typeof baseOrpc;
