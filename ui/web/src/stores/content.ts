import * as capnp from 'capnp-ts';
import { UiProtocol } from '../lib/schema/ui_protocol.capnp';
import { connectToServer } from '../lib/ui-common/extendedmind_ui_wasm';
import { readable } from 'svelte/store';
import { credentials } from './credentials';

const { subscribe } = readable();

function typedArrayToBuffer(array: Uint8Array): ArrayBuffer {
    return array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset);
}

const loadUiProtocol = (buffer: ArrayBuffer): UiProtocol => {
    const message = new capnp.Message(buffer);
    return message.getRoot(UiProtocol);
};

const syncWithServer = async (
    storedDocUrl: string,
    storedEncryptionKey: string,
    setContent: (newContent: Object) => void,
): Promise<void> => {
    window['jsUiProtocol'] = (data: Uint8Array): Promise<void> => {
        return new Promise((resolve) => {
            const uiProtocol = loadUiProtocol(typedArrayToBuffer(data));
            const newContent = {
                diary: uiProtocol.getPayload().getInit().getVersion(),
            };
            setContent(newContent);
            resolve();
        });
    };

    const serverWsHost = window?.process?.env?.EXTENDEDMIND_SERVER_HTTP_PORT
        ? `${window.location.hostname}:${window.process.env.EXTENDEDMIND_SERVER_HTTP_PORT}`
        : window.location.host;
    await connectToServer(serverWsHost, storedDocUrl, storedEncryptionKey);
    // Not expected to actually return, but throw an error
};

export const content = readable(null, function start(setContent: (newContent: Object) => void) {
    credentials.subscribe((credentials) => {
        if (credentials.docUrl && credentials.encryptionKey) {
            syncWithServer(credentials.docUrl, credentials.encryptionKey, setContent).catch(
                (err) => {
                    console.error('Error polling', err);
                },
            );
        }
    });
    return function stop() { };
});
