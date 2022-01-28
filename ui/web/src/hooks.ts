import type { Handle } from '@sveltejs/kit';

export async function handle({ event, resolve }): Handle {
    const response = await resolve(event, {
        ssr: false,
    });
    return response;
}
