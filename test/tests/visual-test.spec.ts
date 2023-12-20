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

  await page.waitForTimeout(1000);

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

  // await new Promise(resolve => setTimeout(resolve, 3000));

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
}

async function takeScreenshot(page: Page, name: string) {
  await page.mouse.move(128, 16);
  await page.waitForTimeout(process.env.CI ? 100 : 0);
  await page.screenshot({ path: `./screenshots/${name}.png` });
  await page.waitForTimeout(process.env.CI ? 100 : 0);
}

test('Startup', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await page.screenshot({ path: `./detailed-screenshots/initial.png` });
});

test('All Editors Closed', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  await vscodeCommand(page, 'View: Close All Editors');
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
