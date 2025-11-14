import { oc } from "@orpc/contract";
import { type } from "arktype";
import { users } from "../server/db/schema";
import { createSelectSchema, createInsertSchema } from "drizzle-arktype";

export const userSelectSchema = createSelectSchema(users);

export const userInsertSchema = createInsertSchema(users).omit(
  "createdAt",
  "updatedAt",
);

// Extended output schema for add route with foo property
export const userAddOutputSchema = userSelectSchema.merge(
  type({
    foo: "'bar'",
  }),
);
