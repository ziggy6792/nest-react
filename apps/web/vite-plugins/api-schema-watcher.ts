import type { Plugin } from 'vite';
import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { createHash } from 'crypto';
import { generate } from 'orval';

const workspacePath = process.env.INIT_CWD!;
const configPath = resolve(workspacePath, 'orval.config.ts');

export function apiSchemaWatcher(): Plugin {
  let isRegenerating = false;
  let lastSchemaHash: string | null = null;

  const getFileHash = (filePath: string): string | null => {
    if (!existsSync(filePath)) return null;
    try {
      const content = readFileSync(filePath, 'utf-8');
      return createHash('md5').update(content).digest('hex');
    } catch {
      return null;
    }
  };

  return {
    name: 'api-schema-watcher',
    apply: 'serve', // Only run in dev mode
    configureServer(server) {
      const schemaPath = resolve(workspacePath, '../api/out/openapi.json');

      const regenerate = async () => {
        if (isRegenerating) return;
        isRegenerating = true;

        try {
          console.log('🔄 OpenAPI schema changed, regenerating API client...');
          await generate(configPath, workspacePath);
          console.log('✅ API client regenerated');
        } catch (error) {
          console.error('❌ Failed to regenerate API client:', error);
        } finally {
          isRegenerating = false;
        }
      };

      // Watch the schema file
      server.watcher.add(schemaPath);
      server.watcher.on('change', (file) => {
        if (file === schemaPath) {
          // Check if content actually changed
          const currentHash = getFileHash(schemaPath);
          if (currentHash && currentHash !== lastSchemaHash) {
            lastSchemaHash = currentHash;
            regenerate();
          }
        }
      });

      // Initial generation if file exists
      if (existsSync(schemaPath)) {
        // Small delay to ensure API server has written the file completely
        setTimeout(() => {
          const initialHash = getFileHash(schemaPath);
          if (initialHash) {
            lastSchemaHash = initialHash;
            regenerate();
          }
        }, 1000);
      } else {
        console.log('⏳ Waiting for OpenAPI schema file...');
      }
    },
  };
}
