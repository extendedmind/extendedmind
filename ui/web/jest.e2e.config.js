const path = require('path');

module.exports = async () => {

    function getExtraArg(argName, resolvePath, defaultValue) {
        const index = process.argv.indexOf(argName);
        let value = defaultValue;
        if (index > 0 && index < process.argv.length - 1) {
            value = process.argv[index + 1];
        }
        if (!value) {
            throw new Error(`Could not find argument ${argName} from ${process.argv}`);
        }
        return resolvePath ? path.resolve(value) : value;
    }

    const playwrightConfig = getExtraArg('--playwright-config', true, 'jest-playwright.config.js');
    const hubBin = getExtraArg('--hub-bin', true);
    const hubPort = getExtraArg('--hub-port');

    process.env.JEST_PLAYWRIGHT_CONFIG = playwrightConfig;
    process.env.EXTENDEDMIND_HUB_BIN = hubBin;
    process.env.EXTENDEDMIND_HUB_PORT = hubPort;

    return {
        name: 'E2E tests',
        verbose: true,
        haste: {
            enableSymlinks: true,
        },
        testMatch: ['**/*.spec.js'],
        preset: 'jest-playwright-preset',
    };
};
