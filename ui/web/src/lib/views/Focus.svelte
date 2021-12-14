<script lang="ts">
    import { content } from '../../stores/content';
</script>

<section class="diary">
    <h1>Diary</h1>
    {#if $content}
        <div id="diaryContent">{$content.diary}</div>
    {:else}
        <span>loading...</span>
    {/if}
</section>

<section class="agenda" />
