import * as capnp from 'capnp-ts';
import { UiProtocol } from '../lib/schema/ui_protocol.capnp';
import wasm from '../lib/ui-common/extendedmind_ui_common_wasm_bg.wasm';
import init, { connectToHub } from '../lib/ui-common/extendedmind_ui_common_wasm';
import { readable } from 'svelte/store';
import { hubKey } from './hubKey';

const { subscribe } = readable();

const loadUiProtocol = (buffer: ArrayBuffer): UiProtocol => {
    const message = new capnp.Message(buffer);
    return message.getRoot(UiProtocol);
};

const syncWithHub = async (
    storedHubKey: string,
    setContent: (newContent: Object) => void,
): void => {
    window['jsUiProtocol'] = (data: Uint8Array): Promise<void> => {
        return new Promise((resolve) => {
            const uiProtocol = loadUiProtocol(data);
            const newContent = {
                diary: uiProtocol.getPayload().getInit().getVersion(),
            };
            setContent(newContent);
            resolve();
        });
    };

    const wasmExports = await init(wasm);
    const hubWsHost = window?.process?.env?.EXTENDEDMIND_HUB_PORT
        ? `${window.location.hostname}:${window.process.env.EXTENDEDMIND_HUB_PORT}`
        : window.location.host;
    await connectToHub(hubWsHost, storedHubKey);
    // Not expected to actually return, but throw an error
};

export const content = readable(null, function start(setContent: (newContent: Object) => void) {
    hubKey.subscribe((storedHubKey) => {
        if (storedHubKey) {
            syncWithHub(storedHubKey, setContent).catch((err) => {
                console.error('Error polling', err);
            });
        }
    });
    return function stop() {};
});