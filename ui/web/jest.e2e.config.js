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
    const serverBin = getExtraArg('--server-bin', true);
    const serverHttpPort = getExtraArg('--server-http-port');
    const serverTcpPort = getExtraArg('--server-tcp-port');
    const serverDataDir = getExtraArg('--server-data-dir', true);
    const cliBin = getExtraArg('--cli-bin', true);
    const cliDataDir = getExtraArg('--cli-data-dir', true);
    const distDir = getExtraArg('--dist-dir', true);

    // Socket files need to be in the temporary dir because of socket file name length restrictions,
    // see: https://bazel.build/reference/test-encyclopedia#test-interaction-filesystem
    let randomSeed = (Math.random() + 1).toString(36).substring(7);

    process.env.JEST_PLAYWRIGHT_CONFIG = playwrightConfig;
    process.env.EXTENDEDMIND_SERVER_BIN = serverBin;
    process.env.EXTENDEDMIND_SERVER_HTTP_PORT = serverHttpPort;
    process.env.EXTENDEDMIND_SERVER_TCP_PORT = serverTcpPort;
    process.env.EXTENDEDMIND_SERVER_DATA_DIR = serverDataDir;
    process.env.EXTENDEDMIND_SERVER_SOCKET = `${process.env.TMPDIR}/${randomSeed}.sock`;
    process.env.EXTENDEDMIND_CLI_BIN = cliBin;
    process.env.EXTENDEDMIND_CLI_DATA_DIR = cliDataDir;
    process.env.EXTENDEDMIND_UI_WEB_DIST = distDir;

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
