<script lang="ts">
    import wasm from '../ui-common/extendedmind_ui_common_wasm_bg.wasm';
    import init from '../ui-common/extendedmind_ui_common_wasm';
    init(wasm).then((wasmExports) => {
       console.log(wasmExports.double(55));
    });
</script>


<header>
    <div class="corner" />

    <div class="corner" />
</header>

<style>
    header {
        display: flex;
        justify-content: space-between;
    }
    .corner {
        width: 3em;
        height: 3em;
    }
</style>
