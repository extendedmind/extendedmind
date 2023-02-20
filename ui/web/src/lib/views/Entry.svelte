<script lang="ts">
    import Icon from '$lib/Icon.svelte';
    import Header from '$lib/header/Header.svelte';
    import { docUrl, encryptionKey } from '../../stores/credentials';

    let formValues: { docUrlInput: string | null; encryptionKeyInput: string | null } = {
        docUrlInput: $docUrl,
        encryptionKeyInput: $encryptionKey,
    };

    function onSubmitCredentials() {
        $docUrl = formValues.docUrlInput;
        $encryptionKey = formValues.encryptionKeyInput;
    }
</script>

<svelte:head>
    <title>extended mind</title>
</svelte:head>

<section>
    <Header />
    <Icon name="logo" />
    <h1>Enter the document URL and encryption key</h1>
    <form on:submit|preventDefault={onSubmitCredentials}>
        <input name="docUrl" bind:value={formValues.docUrlInput} />
        <input name="encryptionKey" bind:value={formValues.encryptionKeyInput} />
        <button type="submit">submit</button>
    </form>
    <footer>
        <p>visit <a href="https://extendedmind.org">extendedmind.org</a> for more info</p>
    </footer>
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex: 1;
    }
    footer {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 40px;
    }

    footer a {
        font-weight: bold;
    }

    @media (min-width: 480px) {
        footer {
            padding: 40px 0;
        }
    }
</style>
