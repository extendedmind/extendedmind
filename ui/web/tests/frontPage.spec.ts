beforeAll(async () => {
  await page.goto(`http://localhost:${process.env.EXTENDEDMIND_HUB_PORT}/extendedmind`)
})

test('should navigate to extendedmind UI front page', async () => {
  expect(await page.title()).toBe('extended mind');
})
