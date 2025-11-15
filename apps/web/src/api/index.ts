// Export the nested API structure
export { api, default } from "./api";

// Also export direct hooks for backward compatibility
export * from "./generated/users/users";
export * from "./generated/app/app";
export * from "./generated/client.schemas";
