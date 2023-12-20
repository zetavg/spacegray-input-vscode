# Visual Tests

## How to Run Tests (macOS)

1. Run `npm install`.
2. `cd sample-project && npm install && cd ..`.
3. `git clone --depth 100 https://github.com/microsoft/vscode.git vscode`.
4. Run `npm run patch-vscode` to patch VSCode.
5. Run `yarn && yarn compile` in vscode and wait about 3-10 minutes.
6. Run `./scripts/code.sh` in vscode to test that VSCode can open successfully.
7. Run `./scripts/code-cli.sh --install-extension ../../spacegray-input-vscode.vsix` in vscode to install the theme (package the theme with `npx vsce package --out spacegray-input-vscode.vsix` in the project first).
8. Install other extensions:

```bash
./scripts/code-cli.sh --install-extension Orta.vscode-jest
```

Finally, run `npm run test`. Screenshots will be stored in `./screenshots`.
