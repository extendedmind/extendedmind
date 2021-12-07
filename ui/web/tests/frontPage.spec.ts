beforeAll(async () => {
    // TODO: find public key here
    console.log(process.env.EXTENDEDMIND_HUB_DATA_DIR);
    await page.goto(`http://localhost:${process.env.EXTENDEDMIND_HUB_PORT}/extendedmind`)
})

test('should navigate to extendedmind UI front page', async () => {
    expect(await page.title()).toBe('extended mind');
})
