import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';
import { getExtraArg } from './conf/tools.js';

const outputDirectory = getExtraArg('--out-dir', true, 'dist/extendedmind');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

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
