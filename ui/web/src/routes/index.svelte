<script lang="ts">
    import Entry from '$lib/views/Entry.svelte';
    import Focus from '$lib/views/Focus.svelte';
    import { docUrl } from '../stores/credentials';
</script>

<svelte:head>
    <title>extended mind v2</title>
</svelte:head>

{#if $docUrl}
    <Focus />
{:else}
    <Entry />
{/if}
