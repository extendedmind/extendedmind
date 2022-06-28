import * as path from 'path';
import * as fs from 'fs';

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

export function getExtraArg(argName, resolvePath, defaultValue) {
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

export function prepareExternalDeps() {
    // Copy schema files
    const schemaDirectory = getExtraArg(
        '--schema-dir',
        true,
        '../../bazel-out/darwin-fastbuild/bin/schema/src',
    );
    const schemaOutputDirectory = path.join('.', 'src/lib/schema');
    if (!fs.existsSync(schemaOutputDirectory)) {
        fs.mkdirSync(schemaOutputDirectory);
    }
    const schemaFiles = fs.readdirSync(schemaDirectory);
    const copySchemaFiles = [];
    schemaFiles.forEach((schemaFile) => {
        if (schemaFile.endsWith('.ts') && !schemaFile.endsWith('.d.ts')) {
            copySchemaFiles.push({
                input: schemaFile,
                output: schemaFile,
            });
        }
    });

    copySchemaFiles.forEach((copySchemaFile) => {
        const inputSchemaFilePath = fs.realpathSync(
            path.join(schemaDirectory, copySchemaFile.input),
        );
        const content = fs.readFileSync(inputSchemaFilePath, { encoding: 'utf8', flag: 'r' });
        fs.writeFileSync(path.join(schemaOutputDirectory, copySchemaFile.output), content);
    });

    // Copy WASM files
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
