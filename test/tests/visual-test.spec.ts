import { ElectronApplication, Page } from '@playwright/test';

import { test } from '@playwright/test';
import { _electron as electron } from 'playwright';

import fs from 'fs';
import path from 'path';

const vscodeExecutablePath = path.join(__dirname, '../vscode/scripts/code.sh');
const themeCssPath = path.join(__dirname, '../../themes/css/main.css');
const themeCss = fs.readFileSync(themeCssPath, 'utf8');

const sampleProjectPath = path.join(__dirname, '../sample-project');

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

  const electronApp = await electron.launch({
    executablePath: vscodeExecutablePath,
    args: [sampleProjectPath],
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

  // Set viewport size, we use "* 2" with VSCode settings of window.zoomLevel as 4 to take screenshots at 2x.
  page.setViewportSize({ width: 1280 * 2, height: 800 * 2 });

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
    await page.waitForTimeout(process.env.CI ? 500 : 200);
    await page.locator('.part.titlebar .window-title .search-label').click();
    await page
      .locator('.quick-input-widget .quick-input-and-message input')
      .fill(`> ${command}`);
    await page.waitForTimeout(process.env.CI ? 500 : 200);
    await page
      .locator('.quick-input-list-row')
      // .filter({ hasText: command })
      .locator(
        `xpath=.//text()[normalize-space(.)='${command}']/ancestor::div[contains(@class, 'quick-input-list-row')]`,
      )
      .first()
      .press('Enter');
    await page.waitForTimeout(process.env.CI ? 2000 : 800);
  } catch (e) {
    if (e instanceof Error) {
      e.message = `Error while executing command "${command}": ${e.message}`;
    }

    throw e;
  }
}

async function openProjectFile(page: Page, fileName: string) {
  try {
    await page.waitForTimeout(process.env.CI ? 500 : 200);
    await page.locator('.part.titlebar .window-title .search-label').click();
    await page
      .locator('.quick-input-widget .quick-input-and-message input')
      .fill(`${fileName}`);
    await page.waitForTimeout(process.env.CI ? 500 : 200);
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
    await page.waitForTimeout(process.env.CI ? 2000 : 800);
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
  { resetFocus: rf = true }: { resetFocus?: boolean } = {},
) {
  if (rf) {
    await resetFocus(page);
  }
  await page.waitForTimeout(process.env.CI ? 100 : 0);
  await page.screenshot({ path: `./screenshots/${name}.png` });
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
});

test('Startup', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await page.screenshot({ path: `./detailed-screenshots/initial.png` });
});

test('All Editors Closed', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await vscodeCommand(page, 'View: Close All Editors');
  await page.waitForTimeout(500);
  await vscodeCommand(page, 'View: Close All Editors');
  await page.waitForTimeout(500);
  await takeScreenshot(page, 'all-editors-closed');
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
  await vscodeCommand(page, 'View: Close All Editors');
  await vscodeCommand(page, 'Open User Settings (JSON)');
  await takeScreenshot(page, 'user-settings-json');
});

test('TypeScript React File', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await openProjectFile(page, 'App.tsx');
  await takeScreenshot(page, 'typescript-react-file');
});

test('CSS File', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await openProjectFile(page, 'index.css');
  await takeScreenshot(page, 'css-file');

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

// test('test', async () => {
//   const { electronAppWindow: page } = await getElectronApp();

//   await page.locator('.part.titlebar .window-title .search-label').click();
//   await page.screenshot({ path: `./screenshots/first-quick-input-opened.png` });

//   await page
//     .locator('.quick-input-widget .quick-input-and-message input')
//     .fill('> Search: Find in Files');
//   await page.screenshot({
//     path: `./screenshots/quick-input-find-in-files.png`,
//   });

//   await page
//     .locator('.quick-input-list-row')
//     .filter({ hasText: 'Find in Files' })
//     .press('Enter');
//   await page.screenshot({ path: `./screenshots/find-in-files.png` });
// });
