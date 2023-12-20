import { ElectronApplication, Page } from '@playwright/test';

import { test, expect } from '@playwright/test';
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

  // Inject theme CSS
  await page.evaluate((css: string) => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }, themeCss);

  await page.waitForTimeout(1000);

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

test('start app', async () => {
  const { electronAppWindow: page } = await getElectronApp();
  page.setViewportSize({ width: 1024, height: 768 });

  await page.locator('.tabs-and-actions-container .tab:first-child').click();
  await page.screenshot({ path: `./screenshots/initial.png` });
});

test('test', async () => {
  const { electronAppWindow: page } = await getElectronApp();

  await page.locator('.part.titlebar .window-title .search-label').click();
  await page.screenshot({ path: `./screenshots/first-quick-input-opened.png` });

  await page
    .locator('.quick-input-widget .quick-input-and-message input')
    .fill('> Search: Find in Files');
  await page.screenshot({
    path: `./screenshots/quick-input-find-in-files.png`,
  });

  await page
    .locator('.quick-input-list-row')
    .filter({ hasText: 'Find in Files' })
    .press('Enter');
  await page.screenshot({ path: `./screenshots/find-in-files.png` });
});
