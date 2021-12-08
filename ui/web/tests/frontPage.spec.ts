const fs = require('fs').promises;

let hubKey;

beforeAll(async () => {
    // TODO: find public key here
    const hubKeyFile = `${process.env.EXTENDEDMIND_HUB_DATA_DIR}/HUB_KEY.txt`;
    hubKey = await fs.readFile(hubKeyFile, "utf8");
    await page.goto(`http://localhost:${process.env.EXTENDEDMIND_HUB_PORT}/extendedmind`)
})

test('should navigate to extendedmind UI front page', async () => {
    console.log("Hub Key", hubKey);
    expect(await page.title()).toBe('extended mind');
})
