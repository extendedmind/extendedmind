// import { Page } from '@playwright/test';
// export function tests(): Array<{name: string, impl: (page: Page) => Promise<void>}> {
//     return [{
//         name: 'load front page',
//         impl: async (page: Page) => {
//            await page.goto('https://playwright.dev/');
//            const title = page.locator('.navbar__inner .navbar__title');
//            await expect(title).toHaveText('Playwright');
//         }
//     }];
// }
//
// import {test, expect} from '@playwright/test';
// test('basic test', async ({ page }) => {
//   await page.goto('https://playwright.dev/');
//   const title = page.locator('.navbar__inner .navbar__title');
//   await expect(title).toHaveText('Playwright');
// });

beforeAll(async () => {
  await page.goto('https://whatismybrowser.com/')
})

test('should display correct browser', async () => {
  const browser = await page.$eval('.string-major', (el) => el.innerHTML)
  expect(browser).toContain('Chrome')
})
