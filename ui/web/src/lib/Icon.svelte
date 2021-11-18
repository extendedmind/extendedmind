<script lang="ts">
    import { base } from '$app/paths';
    export let name: string;

    // SvelteKit issue #2282 requires this kind of dumb workaround
    const staticBase = process.env.NODE_ENV === 'development' ? '' : base;

    const useDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const icons = {
        logo: {
            alt: 'extended mind logo',
            srcLight: `${staticBase}/logo.svg`,
            srcDark: `${staticBase}/logo-inverse.svg`,
        },
        logoText: {
            alt: 'extended mind logo with text',
            srcLight: `${staticBase}/logo-text.svg`,
            srcDark: `${staticBase}/logo-text-inverse.svg`,
        },
    };
    const icon = icons[name];
    if (!icon.src) {
        icon.src = useDarkTheme ? icon.srcDark : icon.srcLight;
    }
</script>

<img alt={icon.alt} class={$$props.class} src={icon.src} />
