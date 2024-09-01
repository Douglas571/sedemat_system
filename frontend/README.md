# SEDEMAT Administrative System

## Before start using 

1. Remember to set your localhost or ip address as exception in ["Insecure origins treated as secure"](chrome://flags/#unsafely-treat-insecure-origin-as-secure) flag for chrome. This allow you to use features like copy to clipboard, microphone and camera over a not secure HTTP protocol.

### Before you start coding

- [ ] If you don't plan to use GitHub Actions, delete the `.github` directory.
- [ ] Clean up the `cypress/e2e/index.spec.ts` file.
- [ ] Change the `favicon.png`, `apple-touch-icon.png`, `android-chrome-192x192.png` and `android-chrome-512x512.png`. [favicon.io](https://favicon.io) is a cool tool for generating these assets.
- [ ] In the `src` folder, remove the `__tests__`, `api` and `components` folder and the `types.ts` file.
- [ ] If you don't plan to use `react-query`, remove the query client logic in the `main.tsx` file.
- [ ] Change the title, description and theme color in the `index.html` and `vite.config.ts`. The [Inter](https://rsms.me/inter/) font is included, so remove it if you want.
- [ ] Modify or delete the `LICENSE` file.
- [ ] Change the `name` field in package.json.

## Scripts

- `pnpm dev` - start a development server with hot reload.
- `pnpm build` - build for production. The generated files will be on the `dist` folder.
- `pnpm preview` - locally preview the production build.
- `pnpm test` - run unit and integration tests related to changed files based on git.
- `pnpm test:ci` - run all unit and integration tests in CI mode.
- `pnpm test:e2e` - run all e2e tests with the Cypress Test Runner.
- `pnpm test:e2e:headless` - run all e2e tests headlessly.
- `pnpm format` - format all files with Prettier.
- `pnpm lint` - runs TypeScript, ESLint and Stylelint.
- `pnpm validate` - runs `lint`, `test:ci` and `test:e2e:ci`.
