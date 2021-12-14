import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
import * as path from 'path';
import * as fs from 'fs';

function getExtraArg(argName, resolvePath, defaultValue) {
    const index = process.argv.indexOf(argName);
    let value = defaultValue;
    if (index > 0 && index < process.argv.length - 1) {
        value = process.argv[index + 1];
    }
    if (!value) {
        throw new Error(`Could not find argument ${argName} from ${process.argv}`);
    }
    return resolvePath ? path.resolve(value) : value;
}

function workAroundSvelteKitIssue1896(jsFileContent) {
    // new URL with import.meta.url isn't supported yet so we need to edit the wasm-bindgen
    // javascript file

    let modifiedJsFileContent = '';
    const lines = jsFileContent.split(/\r?\n/);
    let nextLineNeedsCommenting = false;
    lines.forEach((line) => {
        if (
            nextLineNeedsCommenting ||
            (line.includes('new URL(') && line.includes('import.meta.url);'))
        ) {
            modifiedJsFileContent += '// ' + line + '\n';
            nextLineNeedsCommenting = false;
        } else if (line.includes('init.__wbindgen_wasm_module = module;')) {
            modifiedJsFileContent += line + '\n';
            modifiedJsFileContent += '    } else {wasm = await input(imports);}';
        } else {
            modifiedJsFileContent += line + '\n';
        }
        if (line.includes('input = fetch(input);')) {
            nextLineNeedsCommenting = true;
        }
    });
    return modifiedJsFileContent;
}

function prepareUiCommon() {
    const wasmDirectory = getExtraArg(
        '--wasm-dir',
        true,
        '../../bazel-out/darwin-fastbuild/bin/ui/common',
    );
    const wasmOutputDirectory = path.join('.', 'src/lib/ui-common');
    const uiCommonWasmFileName = 'extendedmind_ui_common_wasm_bg.wasm';
    const uiCommonJsFileName = 'extendedmind_ui_common_wasm.js';
    const uiCommonTsFileName = 'extendedmind_ui_common_wasm.d.ts';

    if (!fs.existsSync(wasmOutputDirectory)) {
        fs.mkdirSync(wasmOutputDirectory);
    }

    const uiCommonWasmFilePath = fs.realpathSync(path.join(wasmDirectory, uiCommonWasmFileName));
    const uiCommonJsFilePath = fs.realpathSync(path.join(wasmDirectory, uiCommonJsFileName));
    const uiCommonTsFilePath = fs.realpathSync(path.join(wasmDirectory, uiCommonTsFileName));

    fs.writeFileSync(
        path.join(wasmOutputDirectory, uiCommonWasmFileName),
        fs.readFileSync(uiCommonWasmFilePath, { flag: 'r' }),
    );

    fs.writeFileSync(
        path.join(wasmOutputDirectory, uiCommonJsFileName),
        workAroundSvelteKitIssue1896(
            fs.readFileSync(uiCommonJsFilePath, { encoding: 'utf8', flag: 'r' }),
        ),
    );

    fs.writeFileSync(
        path.join(wasmOutputDirectory, uiCommonTsFileName),
        fs.readFileSync(uiCommonTsFilePath, { encoding: 'utf8', flag: 'r' }),
    );
}

const outputDirectory = getExtraArg('--out-dir', true, 'dist/extendedmind');
if (fs.existsSync('src/lib')) {
    prepareUiCommon();
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
        // hydrate the <div id="extendedmind"> element in src/app.html
        target: '#extendedmind',
    },
};

export default config;
