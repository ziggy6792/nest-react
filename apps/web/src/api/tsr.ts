import { initQueryClient } from "@ts-rest/react-query";
import { users } from "@contract/users.contract";

const baseUrl =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const tsr = initQueryClient(users, {
  baseUrl,
  baseHeaders: {},
});

