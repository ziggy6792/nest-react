import { type } from "arktype";
import { users } from "../server/db/schema";
import { createSelectSchema, createInsertSchema } from "drizzle-arktype";

export const userSelectSchema = createSelectSchema(users);

// Simple example
// export const userInsertSchema = createInsertSchema(users).omit(
//   "createdAt",
//   "updatedAt",
// );

// Need to write transformer for incoming dates
export const userInsertSchema = createInsertSchema(users, {
  createdAt: () => type("string").pipe((v) => new Date(v)),
  updatedAt: () => type("string").pipe((v) => new Date(v)),
});

export type InsertUser = typeof userInsertSchema.infer;

// Extended output schema for add route with foo property
export const userAddOutputSchema = userSelectSchema.merge(
  type({
    foo: "'bar'",
  }),
);

export type UserAddOutputSchema = typeof userAddOutputSchema.infer;
