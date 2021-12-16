<script lang="ts">
    import Entry from '$lib/views/Entry.svelte';
    import Focus from '$lib/views/Focus.svelte';
    import { hubKey } from '../stores/hubKey';
</script>

<svelte:head>
    <title>extended mind v2</title>
</svelte:head>

{#if $hubKey}
    <Focus />
{:else}
    <Entry />
{/if}
