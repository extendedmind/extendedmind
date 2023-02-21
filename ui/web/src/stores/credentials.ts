import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
const DOC_URL_KEY = 'docUrl';
const storedDocUrl: string | null = browser ? localStorage.getItem(DOC_URL_KEY) : null;
export const docUrl = writable(storedDocUrl);

const ENCRYPTION_KEY_KEY = 'encryptionKey';
const storedEncryptionKey: string | null = browser
    ? localStorage.getItem(ENCRYPTION_KEY_KEY)
    : null;
export const encryptionKey = writable(storedEncryptionKey);

export const credentials = derived([docUrl, encryptionKey], ([$docUrl, $encryptionKey]) => {
    return { docUrl: $docUrl, encryptionKey: $encryptionKey };
});

if (browser) {
    docUrl.subscribe((newDocUrl) => {
        if (newDocUrl) localStorage.setItem(DOC_URL_KEY, newDocUrl);
    });
    encryptionKey.subscribe((newEncryptionKey) => {
        if (newEncryptionKey) localStorage.setItem(ENCRYPTION_KEY_KEY, newEncryptionKey);
    });
}
