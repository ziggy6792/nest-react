import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: 'http://localhost:3001/swagger/json',
    },
    output: {
      target: './src/api/generated/client.ts',
      client: 'react-query',
      mode: 'tags-split',
      mock: {
        type: 'msw',
        delay: false, // 👈 Remove delay completely
      },
      override: {
        mutator: {
          path: './src/api/generated/mutator.ts',
          name: 'customInstance',
        },
        query: {
          useQuery: true,
          useInfinite: false,
        },
      },
    },
  },
});
