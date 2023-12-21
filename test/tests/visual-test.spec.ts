import { ElectronApplication, Page } from '@playwright/test';

import { test } from '@playwright/test';
import { _electron as electron } from 'playwright';

import fs from 'fs';
import path from 'path';

const vscodeExecutablePath = path.join(__dirname, '../vscode/scripts/code.sh');
const vscodeSettingsPath = path.join(__dirname, '../vscode-settings.json');
const vscodeSettings = fs.readFileSync(vscodeSettingsPath, 'utf8');
const themeCssPath = path.join(__dirname, '../../themes/css/main.css');
const themeCss = fs.readFileSync(themeCssPath, 'utf8');

const vscodeUserDataDir = '/tmp/vscode-test-spacegray-input';

const sampleProjectPath = path.join(__dirname, '../sample-project');
const sampleProjectAppTsxPath = path.join(sampleProjectPath, 'src', 'App.tsx');
const sampleProjectAppTsxEditedPath = path.join(
  sampleProjectPath,
  'src',
  'App-edited.tsx',
);
const sampleProjectNewComponentPath = path.join(
  sampleProjectPath,
  'src',
  'NewComponent.tsx',
);
const sampleProjectAppTsxContent = fs.readFileSync(
  sampleProjectAppTsxPath,
  'utf8',
);
const sampleProjectAppTsxEditedContent = fs.readFileSync(
  sampleProjectAppTsxEditedPath,
  'utf8',
);

let openedElectronApp: ElectronApplication;
let openedElectronAppWindow: Page;
async function getElectronApp(): Promise<{
  electronApp: ElectronApplication;
  electronAppWindow: Page;
}> {
  if (openedElectronApp && openedElectronAppWindow)
    return {
      electronApp: openedElectronApp,
      electronAppWindow: openedElectronAppWindow,
    };

  fs.rmSync(vscodeUserDataDir, { recursive: true, force: true });
  fs.mkdirSync(vscodeUserDataDir, { recursive: true });
  fs.mkdirSync(`${vscodeUserDataDir}/User`, { recursive: true });
  fs.writeFileSync(`${vscodeUserDataDir}/User/settings.json`, vscodeSettings, {
    encoding: 'utf8',
  });

  const electronApp = await electron.launch({
    executablePath: vscodeExecutablePath,
    args: [
      '--user-data-dir=/tmp/vscode-test-spacegray-input',
      sampleProjectPath,
    ],
    timeout: 30000,
  });

  const page = await electronApp.firstWindow();

  electronApp.on('window', async page => {
    const filename = page.url()?.split('/').pop();
    console.log(`Window opened: ${filename}`);

    // capture errors
    page.on('pageerror', error => {
      console.error(error);
    });
    // capture console messages
    page.on('console', msg => {
      console.log(msg.text());
    });
  });

  await page.waitForTimeout(process.env.CI ? 2000 : 1000);
  // To ensure a stable CSS injection, we wait for the titlebar to be visible.
  await page
    .locator('.part.titlebar .window-title')
    .waitFor({ state: 'visible' });
  // Wait for something like "activating extension" to end.
  await page.waitForTimeout(process.env.CI ? 8000 : 2000);

  // Inject theme CSS
  await page.evaluate((css: string) => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }, themeCss);

  // Set window size, we use "* 2" with VSCode settings of window.zoomLevel as 4 to take screenshots at 2x.
  page.setViewportSize({ width: 1280 * 2, height: 800 * 2 });

  const sideMenuDragEdge = page.locator(
    '.horizontal .sash-container .monaco-sash:not(.disabled):nth-child(2)',
  );
  // await sideMenuDragEdge.dragTo(page.locator('.part.sidebar.left'), {
  //   targetPosition: { x: 100 * 2, y: 280 * 2 },
  // });
  await sideMenuDragEdge.hover();
  await page.mouse.down();
  await page.mouse.move(280, 0);
  await page.mouse.up();

  openedElectronApp = electronApp;
  openedElectronAppWindow = page;

  await page.waitForTimeout(process.env.CI ? 2000 : 1000);

  return { electronApp, electronAppWindow: page };
}

test.afterAll(async () => {
  try {
    await (await getElectronApp()).electronApp.close();
  } catch (error) {
    console.log(error);
  }
});

async function vscodeCommand(page: Page, command: string) {
  try {
    await page.waitForTimeout(process.env.CI ? 200 : 100);
    await page.locator('.part.titlebar .window-title .search-label').click();
    await page
      .locator('.quick-input-widget .quick-input-and-message input')
      .fill(`> ${command}`);
    await page.waitForTimeout(process.env.CI ? 200 : 100);
    await page
      .locator('.quick-input-list-row')
      // .filter({ hasText: command })
      .locator(
        `xpath=.//text()[normalize-space(.)='${command}']/ancestor::div[contains(@class, 'quick-input-list-row')]`,
      )
      .first()
      .press('Enter');
    await page.waitForTimeout(process.env.CI ? 1000 : 500);
  } catch (e) {
    if (e instanceof Error) {
      e.message = `Error while executing command "${command}": ${e.message}`;
    }

    throw e;
  }
}

async function openProjectFile(page: Page, fileName: string) {
  try {
    await page.waitForTimeout(process.env.CI ? 200 : 100);
    await page.locator('.part.titlebar .window-title .search-label').click();
    await page
      .locator('.quick-input-widget .quick-input-and-message input')
      .fill(`${fileName}`);
    await page.waitForTimeout(process.env.CI ? 200 : 100);
    await page
      .locator('.quick-input-list-row')
      .filter({ hasText: fileName })
      .first()
      .press('Enter');
    await page.waitForTimeout(process.env.CI ? 200 : 100);
    await vscodeCommand(page, 'File: Focus on Files Explorer');
    await page.waitForTimeout(process.env.CI ? 200 : 100);
    await vscodeCommand(page, 'Collapse Folders in Explorer');
    await page.waitForTimeout(process.env.CI ? 200 : 100);
    await vscodeCommand(page, 'File: Reveal Active File in Explorer View');
    await page.waitForTimeout(process.env.CI ? 1000 : 500);
  } catch (e) {
    if (e instanceof Error) {
      e.message = `Error while opening file "${fileName}": ${e.message}`;
    }

    throw e;
  }
}

async function resetFocus(page: Page) {
  await page.mouse.click(128, 16);
}

async function takeScreenshot(
  page: Page,
  name: string,
  {
    resetFocus: rf = true,
    isDetailed = false,
  }: { resetFocus?: boolean; isDetailed?: boolean } = {},
) {
  if (rf) {
    await resetFocus(page);
  }
  await page.waitForTimeout(process.env.CI ? 100 : 0);
  await page.screenshot({
    path: `./${isDetailed ? 'detailed-' : ''}screenshots/${name}.png`,
  });
  await page.waitForTimeout(process.env.CI ? 100 : 0);
}

test.beforeEach(async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await page.waitForTimeout(process.env.CI ? 100 : 1);
  await vscodeCommand(page, 'View: Close All Editors');
  await page.waitForTimeout(process.env.CI ? 100 : 1);
  await vscodeCommand(page, 'File: Focus on Files Explorer');
  await page.waitForTimeout(process.env.CI ? 100 : 1);
  await vscodeCommand(page, 'Collapse Folders in Explorer');
  await page.waitForTimeout(process.env.CI ? 100 : 1);

  const closeBottomPanelButton = page.locator(
    '.part.panel.basepanel .composite.title .codicon-panel-close',
  );
  if (await closeBottomPanelButton.isVisible({ timeout: 100 })) {
    closeBottomPanelButton.click();
  }
});

test('Startup', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await takeScreenshot(page, 'initial', { isDetailed: true });

  // On CI, wait 20 seconds for the startup messages to disappear.
  await page.waitForTimeout(process.env.CI ? 20000 : 10);
});

test('Command Palette', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await page.waitForTimeout(process.env.CI ? 200 : 100);
  await page.locator('.part.titlebar .window-title .search-label').click();
  await page.waitForTimeout(process.env.CI ? 1000 : 200);
  await takeScreenshot(page, 'command-palette-initial', { resetFocus: false });
  await page
    .locator('.quick-input-widget .quick-input-and-message input')
    .fill('?');
  await page.waitForTimeout(process.env.CI ? 1000 : 200);
  await takeScreenshot(page, 'command-palette-help', { resetFocus: false });
  await page
    .locator('.quick-input-widget .quick-input-and-message input')
    .press('Escape');
  await page.locator('.part.titlebar .window-title .search-label').click();
  await page.waitForTimeout(process.env.CI ? 1000 : 200);
  await page
    .locator('.quick-input-widget .quick-input-and-message input')
    .fill('test.ts');
  await page.waitForTimeout(process.env.CI ? 1000 : 200);
  await takeScreenshot(page, 'command-palette-files', { resetFocus: false });
  await page
    .locator('.quick-input-widget .quick-input-and-message input')
    .press('Escape');
});

test('All Editors Closed', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await vscodeCommand(page, 'View: Close All Editors');
  await page.waitForTimeout(500);
  await vscodeCommand(page, 'View: Close All Editors');
  await page.waitForTimeout(500);
  await takeScreenshot(page, 'all-editors-closed', { isDetailed: true });
});

test('Welcome', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await vscodeCommand(page, 'View: Close All Editors');
  await vscodeCommand(page, 'Help: Welcome');
  await page.waitForTimeout(500);
  await vscodeCommand(page, 'Help: Welcome');
  await page.waitForTimeout(500);
  await takeScreenshot(page, 'welcome');
});

test('User Settings JSON', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await vscodeCommand(page, 'Open User Settings (JSON)');
  await takeScreenshot(page, 'user-settings-json', { isDetailed: true });
});

test('User Settings', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await page.keyboard.press('Meta+,');
  await page.waitForTimeout(process.env.CI ? 1000 : 500);
  await takeScreenshot(page, 'user-settings');
});

// test('TypeScript React File', async () => {
//   const { electronAppWindow: page } = await getElectronApp();
//   await openProjectFile(page, 'App.tsx');
//   // await takeScreenshot(page, 'typescript-react-file');

//   await page.locator('.pane-header').filter({ hasText: 'Outline' }).click();
//   await page.waitForTimeout(process.env.CI ? 1000 : 500);
//   await takeScreenshot(page, 'typescript-react-file-outline', {
//     isDetailed: true,
//   });
//   await page.locator('.pane-header').filter({ hasText: 'Outline' }).click();
// });

test('TypeScript React File Edited', async () => {
  const { electronAppWindow: page } = await getElectronApp();

  fs.writeFileSync(sampleProjectAppTsxPath, sampleProjectAppTsxEditedContent, {
    encoding: 'utf8',
  });
  fs.writeFileSync(
    sampleProjectAppTsxEditedPath,
    sampleProjectAppTsxEditedContent + '//',
    {
      encoding: 'utf8',
    },
  );
  fs.writeFileSync(
    sampleProjectNewComponentPath,
    sampleProjectAppTsxEditedContent + '//',
    {
      encoding: 'utf8',
    },
  );

  await page.locator('.pane-header').filter({ hasText: 'Outline' }).click();

  try {
    await page.waitForTimeout(process.env.CI ? 1000 : 500);

    await openProjectFile(page, 'App.tsx');
    await takeScreenshot(page, 'typescript-react-file-edited');

    await vscodeCommand(page, 'Source Control: Focus on Source Control View');
    await page
      .locator('.scm-view')
      .filter({ hasText: 'Changes' })
      .locator('.label-name')
      .filter({ hasText: 'App.tsx' })
      .click();
    await page.waitForTimeout(process.env.CI ? 1000 : 500);
    await takeScreenshot(page, 'typescript-react-file-edited-diff');
    // eslint-disable-next-line no-useless-catch
  } catch (e) {
    throw e;
  } finally {
    await page.keyboard.press('Meta+Shift+E');
    await page.locator('.pane-header').filter({ hasText: 'Outline' }).click();
    fs.writeFileSync(sampleProjectAppTsxPath, sampleProjectAppTsxContent, {
      encoding: 'utf8',
    });
    fs.writeFileSync(
      sampleProjectAppTsxEditedPath,
      sampleProjectAppTsxEditedContent,
      {
        encoding: 'utf8',
      },
    );
    fs.rmSync(sampleProjectNewComponentPath, { recursive: true, force: true });
  }
});

test('CSS File', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await openProjectFile(page, 'index.css');
  await takeScreenshot(page, 'css-file', { isDetailed: true });

  await resetFocus(page);
  await page.locator('.mtk5').filter({ hasText: 'code' }).hover();
  await page
    .locator('.monaco-hover')
    .filter({ hasText: '<code>' })
    .waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
  await takeScreenshot(page, 'css-file-hover-selector', { resetFocus: false });

  await resetFocus(page);
  await page.locator('.mtk9').filter({ hasText: 'Courier New' }).hover();
  await page
    .locator('.monaco-hover')
    .filter({ hasText: 'MDN Reference' })
    .waitFor({ state: 'visible' });
  await page.waitForTimeout(500);
  await takeScreenshot(page, 'css-file-hover-property', { resetFocus: false });
});

test('Binary File', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await openProjectFile(page, 'sample.bin');
  await takeScreenshot(page, 'binary-file');
});

test('Find', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  try {
    await openProjectFile(page, 'index.html');
    await page.waitForTimeout(process.env.CI ? 1000 : 500);
    await vscodeCommand(page, 'Focus Active Editor Group');
    await page.keyboard.press('Meta+F');
    await page.waitForTimeout(process.env.CI ? 1000 : 500);
    // await page.locator('.find-widget textarea').first().fill('icon');
    await page.locator('.find-widget textarea').first().fill('root');
    await page.locator('.find-widget .codicon-whole-word').click();
    await page.waitForTimeout(process.env.CI ? 1000 : 500);
    await takeScreenshot(page, 'find-in-file');
    // eslint-disable-next-line no-useless-catch
  } catch (e) {
    throw e;
  } finally {
    await page.keyboard.press('Meta+F');
    await page.keyboard.press('Escape');
  }
});

test('Search', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await vscodeCommand(page, 'Search: Find in Files');
  await page.waitForTimeout(process.env.CI ? 1000 : 500);
  await page.locator('.search-container textarea').fill('React');
  await page.waitForTimeout(process.env.CI ? 3000 : 1000);
  await takeScreenshot(page, 'search', { isDetailed: true });

  await page.locator('.search-container .codicon-case-sensitive').click();
  await page.waitForTimeout(process.env.CI ? 3000 : 1000);
  await page
    .locator('.monaco-list-row')
    .filter({ hasText: 'Getting Started' })
    .click();
  await page.waitForTimeout(process.env.CI ? 2000 : 1000); // wait for Markdown syntax highlighting in README.md
  await takeScreenshot(page, 'search-case-sensitive');
  await page.locator('.codicon-search-clear-results').first().click();
});

test('Run and Debug', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await openProjectFile(page, 'debug.js');
  await vscodeCommand(page, 'Run and Debug: Focus on Run View');
  await takeScreenshot(page, 'run-and-debug-initial');

  await page
    .locator('.margin-view-overlays > *:nth-child(3) .line-numbers')
    .hover();
  await page.locator('.codicon.codicon-debug-hint').click();

  await page
    .locator('.margin-view-overlays > *:nth-child(6) .line-numbers')
    .hover();
  await page.locator('.codicon.codicon-debug-hint').click();

  await page
    .locator('.welcome-view .monaco-button')
    .filter({ hasText: 'Run and Debug' })
    .click();
  const nodejsSelection = page
    .locator('.quick-input-list-entry')
    .filter({ hasText: 'Node.js' });
  for (let i = 1; i <= 5; i++) {
    if (await nodejsSelection.isVisible({ timeout: 500 })) {
      await nodejsSelection.click();
    }
  }
  // await page
  //   .locator('.debug-toolbar .codicon-debug-stop')
  //   .waitFor({ state: 'visible' });
  await page.locator('.codicon-debug-gripper').hover();
  await page.mouse.down();
  await page.mouse.move(800, 200);
  await page.mouse.up();
  await page.waitForTimeout(process.env.CI ? 2000 : 1000);
  await takeScreenshot(page, 'run-and-debug-breakpoint');
  await page.locator('.debug-toolbar .codicon-debug-stop').click();
});

test('Testing', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await vscodeCommand(page, 'Testing: Focus on Test Explorer View');
  await vscodeCommand(page, 'Test: Clear All Results');
  await page.waitForTimeout(process.env.CI ? 4000 : 2000);
  await page
    .locator('.test-explorer-tree .monaco-list-row')
    .filter({ hasText: 'sample-project' })
    .locator('.codicon-tree-item-expanded.collapsed')
    .click();
  await page
    .locator('.test-explorer-tree .monaco-list-row')
    .filter({ hasText: 'src' })
    .locator('.codicon-tree-item-expanded.collapsed')
    .click();
  await page
    .locator('.test-explorer-tree .monaco-list-row')
    .filter({ hasText: 'tests' })
    .locator('.codicon-tree-item-expanded.collapsed')
    .click();

  await page
    .locator('.test-explorer-tree .monaco-list-row')
    .filter({ hasText: 'not-pass' })
    .hover();
  await page
    .locator('.test-explorer-tree .monaco-list-row')
    .filter({ hasText: 'not-pass' })
    .locator('.codicon-go-to-file')
    .click();

  await takeScreenshot(page, 'testing-initial');

  const runAllButton = page.locator(
    '.title-actions .codicon-testing-run-all-icon',
  );
  await runAllButton.click();
  await takeScreenshot(page, 'testing-in-progress');
  await page.waitForTimeout(process.env.CI ? 4000 : 2000);
  await runAllButton.waitFor({ state: 'visible' });
  await page.waitForTimeout(process.env.CI ? 2000 : 1000);

  await resetFocus(page);
  await page.locator('.mtk6').filter({ hasText: 'expect' }).last().hover();
  await page.waitForTimeout(process.env.CI ? 2000 : 1000);
  await takeScreenshot(page, 'testing-results', { resetFocus: false });
});

test('Problems', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await openProjectFile(page, 'problems.ts');
  await page.waitForTimeout(process.env.CI ? 2000 : 500);
  await vscodeCommand(page, 'View: Focus Problems');
  await page.waitForTimeout(process.env.CI ? 2000 : 500);

  await takeScreenshot(page, 'problems');

  await page.locator('span').locator('text="typeof"').hover();
  await page
    .locator('.monaco-hover-content .action-container a')
    .filter({ hasText: 'View Problem' })
    .click();
  await page.waitForTimeout(process.env.CI ? 1000 : 500);
  await takeScreenshot(page, 'problems-peek-error');
  await page.locator('.peekview-actions .codicon-close').click();

  await page.locator('span').locator('text="sentense"').hover();
  await page
    .locator('.monaco-hover-content .action-container a')
    .filter({ hasText: 'View Problem' })
    .click();
  await page.waitForTimeout(process.env.CI ? 1000 : 500);
  await takeScreenshot(page, 'problems-peek-info');
  await page.locator('.peekview-actions .codicon-close').click();

  await page.locator('span').locator('text="notUsed"').hover();
  await page
    .locator('.monaco-hover-content .action-container a')
    .filter({ hasText: 'View Problem' })
    .click();
  await page.waitForTimeout(process.env.CI ? 1000 : 500);
  await takeScreenshot(page, 'problems-peek-warn');
  await page.locator('.peekview-actions .codicon-close').click();
});
