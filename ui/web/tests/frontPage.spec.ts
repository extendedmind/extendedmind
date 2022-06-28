const fs = require('fs').promises;

let hubKey;

beforeAll(async () => {
    // TODO: find public key here
    const hubKeyFile = `${process.env.EXTENDEDMIND_HUB_DATA_DIR}/HUB_KEY.txt`;
    hubKey = await fs.readFile(hubKeyFile, 'utf8');
    const url = `http://localhost:${process.env.EXTENDEDMIND_HUB_PORT}/extendedmind`;
    console.log(`Navigating to ${url}`);
    await page.goto(url);
});

test('should navigate to extendedmind UI front page', async () => {
    console.log('Hub Key', hubKey);
    await page.type('input[name="hubKey"]', hubKey);
    await page.click('button[type="submit"]');
    const diaryContentText = await page.textContent('#diaryContent');
    await expect(diaryContentText).toBe('2');
});
