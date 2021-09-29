import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
import * as path from 'path';

let outputDirectory = 'dist/extendedmind';
const outputDirectoryIndex = process.argv.indexOf('--out');
if (outputDirectoryIndex > 0 && outputDirectoryIndex < process.argv.length - 1) {
    outputDirectory = path.resolve(process.argv[outputDirectoryIndex + 1]);
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
            base: '/extendedmind',
        },
        ssr: false,
        // hydrate the <div id="svelte"> element in src/app.html
        target: '#svelte',
    },
};

export default config;
