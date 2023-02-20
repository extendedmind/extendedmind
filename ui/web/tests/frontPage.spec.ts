const util = require('util');
const fs = require('fs').promises;
const dotenv = require('dotenv');
const exec = util.promisify(require('child_process').exec);

let docUrl: string | undefined;
let encryptionKey: string | undefined;

beforeAll(async () => {
    const secretsFile = `${process.env.EXTENDEDMIND_CLI_DATA_DIR}/secrets.env`;
    const result = dotenv.config({ path: secretsFile });
    if (result.error) {
        // The file does not exist, run cli to create document, register it to server and backup
        // data for cli to server.
        const cliDefaultOpts = `--data-root-dir ${process.env.EXTENDEDMIND_CLI_DATA_DIR}`;
        const cliCreateOpts = `--encrypted --output ${secretsFile}`;
        await exec(`${process.env.EXTENDEDMIND_CLI_BIN} ${cliDefaultOpts} create ${cliCreateOpts}`);
        const result = dotenv.config({ path: secretsFile });
        if (result.error) {
            throw result.error;
        }
        const serverDefaultOpts = `--admin-socket-file ${process.env.EXTENDEDMIND_SERVER_SOCKET}`;
        const serverRegisterOpts = `--peermerge-doc-url ${process.env.PROXY_DOC_URL}`;
        await exec(`${process.env.EXTENDEDMIND_SERVER_BIN} ${serverDefaultOpts} register ${serverRegisterOpts}`);
        const cliBackupOpts = `--hub-domain localhost --hub-port ${process.env.EXTENDEDMIND_SERVER_TCP_PORT} --encryption-key ${process.env.ENCRYPTION_KEY}`;
        await exec(`${process.env.EXTENDEDMIND_CLI_BIN} ${cliDefaultOpts} back-up ${cliBackupOpts}`);
    }
    docUrl = process.env.DOC_URL;
    encryptionKey = process.env.ENCRYPTION_KEY;
    const url = `http://localhost:${process.env.EXTENDEDMIND_SERVER_HTTP_PORT}/extendedmind`;
    console.log(`Navigating to ${url}`);
    await page.goto(url);
});

test('should navigate to extendedmind UI front page', async () => {
    console.log('Doc Url', docUrl);
    await page.type('input[name="docUrl"]', docUrl);
    await page.type('input[name="encryptionKey"]', encryptionKey);
    await page.click('button[type="submit"]');
    const diaryContentText = await page.textContent('#diaryContent');
    await expect(diaryContentText).toBe('2');
});
