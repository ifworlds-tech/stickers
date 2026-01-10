import { defineConfig } from 'vite'
import type { Plugin, ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { IncomingMessage, ServerResponse } from 'http'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function stickerIndexPlugin() {
  const stickersDir = path.resolve(__dirname, 'public/stickers');
  
  const generateIndex = () => {
    const packs = [];
    if (fs.existsSync(stickersDir)) {
      const items = fs.readdirSync(stickersDir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory()) {
          const manifestPath = path.join(stickersDir, item.name, 'manifest.json');
          if (fs.existsSync(manifestPath)) {
            try {
              const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
              const manifest = JSON.parse(manifestContent);
              packs.push({ ...manifest, path: item.name });
            } catch (e) {
              console.error(`Error reading manifest for ${item.name}:`, e);
            }
          }
        }
      }
    }
    return JSON.stringify(packs, null, 2);
  };

  return {
    name: 'sticker-index-plugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.url === '/stickers/index.json') {
          const indexContent = generateIndex();
          res.setHeader('Content-Type', 'application/json');
          res.end(indexContent);
          return;
        }
        next();
      });
    },
    generateBundle(this: any) {
      const indexContent = generateIndex();
      this.emitFile({
        type: 'asset',
        fileName: 'stickers/index.json',
        source: indexContent
      });
    }
  } as Plugin
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), stickerIndexPlugin()],
})
