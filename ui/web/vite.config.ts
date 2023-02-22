import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import * as fs from 'fs';
import { prepareExternalDeps } from './conf/tools.js';

// There are multiple invocations of this file with vite / svelte, only run prepare once.
if (process.env.EXTERNAL_DEPS_PROCESSED != 'true' && fs.existsSync('svelte.config.js')) {
    prepareExternalDeps();
    process.env.EXTERNAL_DEPS_PROCESSED = 'true';
}

export default defineConfig({
    plugins: [sveltekit(), wasm(), topLevelAwait()],
    test: {
        include: ['src/**/*.{test,spec}.{js,ts}'],
    },

    define: {
        'process.env': process.env,
    },
});
