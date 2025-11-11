/**
 * Type extraction utilities to infer argument types from hook signatures.
 * These allow us to create typed utils without manual type definitions.
 */

/**
 * Extracts the second argument type from a useQuery hook.
 * useQuery signature: (queryKey, args?, options?) => UseQueryResult
 */
export type UseQueryArg<TLeaf> = TLeaf extends {
  useQuery: (...args: any[]) => any;
}
  ? Parameters<TLeaf["useQuery"]>[1] extends infer A
    ? A
    : never
  : never;

/**
 * Extracts the options type from a useMutation hook.
 * Example: UseMutationArg<typeof usersHooks.add> => UseMutationOptions<...>
 */
export type UseMutationArg<TLeaf> = TLeaf extends {
  useMutation: (opts?: infer A) => any;
}
  ? A
  : never;

