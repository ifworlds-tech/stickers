# Sticker Storage

A simple SPA to store and display stickers.

## Adding Stickers

1. Create a new folder in `public/stickers/`.
2. Add a `manifest.json` file in that folder with the following structure:
   ```json
   {
     "id": "your-pack-id",
     "displayName": "Your Pack Name",
     "previewImage": "preview.png",
     "stickers": [
       "sticker1.png",
       "sticker2.png"
     ]
   }
   ```
3. Add your image files to the folder.
4. Run `npm run dev` or `npm run build` to update the index.

## Development

- `npm run dev`: Start development server
- `npm run build`: Build for production

## Cloudflare Pages 部署

### 构建配置

项目已配置好 `wrangler.toml`，Cloudflare Pages 会自动识别：

- **构建命令**: `npm run build`（自动执行）
- **构建输出目录**: `dist`（在 wrangler.toml 中指定）
- **Node 版本**: 20（通过 `.node-version` 文件指定）

### 环境变量

无需额外环境变量。

### 配置文件

- `.node-version` - 指定 Node.js 版本
- `wrangler.toml` - Cloudflare Pages 配置

### 部署说明

1. 连接你的 GitHub 仓库到 Cloudflare Pages
2. 使用上述构建配置
3. 每次推送到 main 分支会自动部署

## 功能特性

- ✅ Hash Router SPA（支持静态托管）
- ✅ 响应式设计（移动端和桌面端自适应）
- ✅ 点击复制表情到剪贴板
- ✅ PNG 图片自动添加白色背景（避免黑底问题）
- ✅ 自动扫描并生成表情包索引（构建时）

## Original Vite Readme

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
