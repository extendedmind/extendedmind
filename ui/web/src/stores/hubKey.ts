import { writable } from 'svelte/store';
import { browser } from '$app/env';
const HUB_KEY_KEY = 'hubKey';
const storedHubKey: string | null = browser ? localStorage.getItem(HUB_KEY_KEY) : null;
export const hubKey = writable(storedHubKey);

if (browser) {
    // TODO: change to docUrl and encryptionKey
    hubKey.subscribe((newHubKeyValue) => {
        if (newHubKeyValue) localStorage.setItem(HUB_KEY_KEY, newHubKeyValue);
    });
}
