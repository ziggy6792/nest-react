import { oc } from "@orpc/contract";
import { type } from "arktype";
import { users } from "../server/db/schema";
import { createSelectSchema, createInsertSchema } from "drizzle-arktype";
import {
  userSelectSchema,
  userInsertSchema,
  userAddOutputSchema,
} from "./users.schemas";

// Define the contract structure (frontend-safe, no NestJS dependencies)
export const usersContract = {
  users: {
    list: oc
      .route({
        method: "GET",
      })
      .output(
        userSelectSchema
          // Technically we should cast the dates, but we can do on client side, its simple
          // .merge(
          //   type({
          //     createdAt: () => type("Date").pipe((v) => v.toISOString()),
          //     updatedAt: () => type("Date").pipe((v) => v.toISOString()),
          //   }),
          // )
          .array(),
      ),
    byId: oc
      .route({
        method: "GET",
      })
      .input(
        type({
          params: type({
            id: "string",
            type: "'foo' | 'bar'",
          }),
        }),
      )
      .output(userSelectSchema),
    // .output(userSelectSchema.onDeepUndeclaredKey('delete')), example
    add: oc
      .route({
        method: "POST",
      })
      .input(
        type({
          body: userInsertSchema,
        }),
      )
      .output(userAddOutputSchema),
  },
};
