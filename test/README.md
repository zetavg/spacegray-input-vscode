# Visual Tests

## How to Run Tests (macOS)

1. Run `npm install`.
2. `cd sample-project && npm install && cd ..`.
3. `git clone --depth 100 https://github.com/microsoft/vscode.git vscode`.
4. Apply this patch in vscode (optional, this is for using a clean user directory for testing):

```diff
--- a/src/vs/platform/environment/node/userDataPath.js
+++ b/src/vs/platform/environment/node/userDataPath.js
@@ -54,6 +54,8 @@
                productName = 'code-oss-dev';
            }

+           productName = 'code-oss-dev-test';
+
            // 1. Support portable mode
            const portablePath = process.env['VSCODE_PORTABLE'];
            if (portablePath) {
```

5. Run `yarn && yarn compile` in vscode and wait about 3-10 minutes.
6. Run `./scripts/code.sh` in vscode to test that VSCode can open successfully.
7. Run `./scripts/code-cli.sh --install-extension ../../spacegray-input-vscode.vsix` in vscode to install the theme (package the theme with `npx vsce package --out spacegray-input-vscode.vsix` in the project first).
8. Open or create `~/Library/Application Support/code-oss-dev-test/User/settings.json` (or `~/Library/Application Support/code-oss-dev/User/settings.json` if you have not patch vscode in step 4) and add the contents in `vscode-settings.json`.

Finally, run `npm run test`. Screenshots will be stored in `./screenshots`.
