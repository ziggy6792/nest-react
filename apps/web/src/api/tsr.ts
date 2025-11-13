import { createORPCClient } from '@orpc/client';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { contract } from '@contract/users.contract';
import { ContractRouterClient } from '@orpc/contract';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';

export const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const link = new OpenAPILink(contract, {
  url: API_BASE,
});

const client: ContractRouterClient<typeof contract> = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
