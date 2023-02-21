import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
import * as fs from 'fs';
import { getExtraArg, prepareExternalDeps } from './conf/tools.js';

const outputDirectory = getExtraArg('--out-dir', true, 'dist/extendedmind');

if (fs.existsSync('svelte.config.js')) {
    prepareExternalDeps();
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: preprocess(),

    kit: {
        adapter: adapter({
            pages: outputDirectory,
            assets: outputDirectory,
        }),
        paths: {
            base: process.env.NODE_ENV == 'development' ? '' : '/extendedmind',
        },
    },
};

export default config;
