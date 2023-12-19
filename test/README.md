# Visual Tests

## How to Run Tests (macOS)

1. Run `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install`.
2. `git clone --depth 100 https://github.com/microsoft/vscode.git vscode`.
3. Apply this patch in vscode (optional, this is for using a clean user directory for testing):

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

4. Run `yarn && yarn compile` in vscode and wait about 3-5 minutes.
5. Run `./scripts/code.sh` in vscode to test that VSCode can open successfully.
6. Run `./scripts/code-cli.sh --install-extension ../../spacegray-input-vscode.vsix` in vscode to install the theme (build the theme with `vsce package --out spacegray-input-vscode.vsix` in the project first).
7. Open or create `~/Library/Application Support/code-oss-dev-test/User/settings.json` (or `~/Library/Application Support/code-oss-dev/User/settings.json` if you have not patch vscode in step 3) and add this:

```
{
    // Disable alerts and notifications
    "security.workspace.trust.startupPrompt": "never",
    "security.workspace.trust.enabled": false,
    "security.workspace.trust.banner": "never",
    "security.workspace.trust.emptyWindow": false,
    "git.openRepositoryInParentFolders": "never",
    // Set theme
    "workbench.colorTheme": "Spacegray Input Dark",
    "workbench.iconTheme": "spacegray",
    "workbench.productIconTheme": "spacegray-icons-carbon",
    // Set font
    "editor.fontFamily": "Input Mono Narrow",
    "editor.fontWeight": "300",
    "editor.fontSize": 16,
    "editor.lineHeight": 1.5,
}
```

Finally, run `npm run test`. Screenshots will be stored in `./screenshots`.
