import * as path from 'path';
import * as fs from 'fs';

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
        '../../bazel-out/darwin-fastbuild/bin/ui/wasm',
    );
    const wasmOutputDirectory = path.join('.', 'src/lib/ui-common');
    const uiWasmBgFileName = 'extendedmind_ui_wasm_bg.wasm';
    const uiWasmBgJsFileName = 'extendedmind_ui_wasm_bg.js';
    const uiWasmBgTsFileName = 'extendedmind_ui_wasm_bg.wasm.d.ts';
    const uiWasmJsFileName = 'extendedmind_ui_wasm.js';
    const uiWasmTsFileName = 'extendedmind_ui_wasm.d.ts';
    if (!fs.existsSync(wasmOutputDirectory)) {
        fs.mkdirSync(wasmOutputDirectory);
    }
    const uiWasmBgFilePath = fs.realpathSync(path.join(wasmDirectory, uiWasmBgFileName));
    const uiWasmBgJsFilePath = fs.realpathSync(
        path.join(wasmDirectory, uiWasmBgJsFileName),
    );
    const uiWasmBgTsFilePath = fs.realpathSync(
        path.join(wasmDirectory, uiWasmBgTsFileName),
    );
    const uiWasmJsFilePath = fs.realpathSync(path.join(wasmDirectory, uiWasmJsFileName));
    const uiWasmTsFilePath = fs.realpathSync(path.join(wasmDirectory, uiWasmTsFileName));
    fs.writeFileSync(
        path.join(wasmOutputDirectory, uiWasmBgFileName),
        fs.readFileSync(uiWasmBgFilePath, { flag: 'r' }),
    );
    fs.writeFileSync(
        path.join(wasmOutputDirectory, uiWasmBgJsFileName),
        fs.readFileSync(uiWasmBgJsFilePath, { flag: 'r' }),
    );
    fs.writeFileSync(
        path.join(wasmOutputDirectory, uiWasmBgTsFileName),
        fs.readFileSync(uiWasmBgTsFilePath, { flag: 'r' }),
    );
    fs.writeFileSync(
        path.join(wasmOutputDirectory, uiWasmJsFileName),
        fs.readFileSync(uiWasmJsFilePath, { encoding: 'utf8', flag: 'r' }),
    );
    fs.writeFileSync(
        path.join(wasmOutputDirectory, uiWasmTsFileName),
        fs.readFileSync(uiWasmTsFilePath, { encoding: 'utf8', flag: 'r' }),
    );
}
