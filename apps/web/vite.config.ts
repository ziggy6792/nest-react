import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import checker from 'vite-plugin-checker';
import { fileURLToPath } from 'url';
import { apiSchemaWatcher } from './vite-plugins/api-schema-watcher';

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const plugins = [react(), checker({ typescript: { tsconfigPath: './tsconfig.app.json' } })];

  // Only add API schema watcher in dev mode
  if (command === 'serve') {
    plugins.push(apiSchemaWatcher());
  }

  return {
    plugins,
    resolve: {
      alias: {
        src: fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 3000,
    },
  };
});
