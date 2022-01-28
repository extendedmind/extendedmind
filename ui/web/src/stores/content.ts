import * as capnp from "capnp-ts";
import { UiProtocol } from '../lib/schema/ui_protocol.capnp';
import wasm from '../lib/ui-common/extendedmind_ui_common_wasm_bg.wasm';
import init, { connectToHub } from '../lib/ui-common/extendedmind_ui_common_wasm';
import { readable } from 'svelte/store';
import { hubKey } from './hubKey';

const { subscribe } = readable();

const loadUiProtocol = (buffer: ArrayBuffer): UiProtocol => {
  const message = new capnp.Message(buffer);
  return message.getRoot(UiProtocol);
}

const syncWithHub = async (storedHubKey: string, setContent: (newContent: Object) => void): void => {
    window['updateContent'] = (numberFromWasm: number): Promise<void> => {
        const newContent =  {
            diary: `${Number(numberFromWasm)}`,
        };
        return new Promise((resolve) => {
            setContent(newContent);
            resolve();
        });
    };

    const wasmExports = await init(wasm);
    await connectToHub(`${window.location.hostname}:8080`, storedHubKey);
    // Not expected to actually return, but throw an error
};

export const content = readable(null, function start(setContent: (newContent: Object) => void) {
    hubKey.subscribe((storedHubKey) => {
        if (storedHubKey) {
            syncWithHub(storedHubKey, setContent)
                .catch((err) => {
                    console.error('Error polling', err);
                });
        }
    });
    return function stop() {};
});
