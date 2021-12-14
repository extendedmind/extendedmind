import wasm from '../lib/ui-common/extendedmind_ui_common_wasm_bg.wasm';
import init from '../lib/ui-common/extendedmind_ui_common_wasm';
import { readable } from 'svelte/store';
import { hubKey } from './hubKey';

const { subscribe } = readable();

const loadContent = async (storedHubKey: string): Object => {
    window['triple'] = (a: number): number => {
        return a * 3;
    };
    const wasmExports = await init(wasm);
    return {
        diary: '55 * 3 = ' + wasmExports.triple_from_js(55),
    };
};

export const content = readable(null, function start(set) {
    hubKey.subscribe((storedHubKey) => {
        if (storedHubKey) {
            loadContent(storedHubKey)
                .then(set)
                .catch((err) => {
                    console.error('Failed to load content', err);
                });
        }
    });
    return function stop() {};
});
