<script lang="ts">
    import { base } from '$app/paths';
    export let name: string;
    const useDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const icons = {
        logo: {
            alt: 'extended mind logo',
            srcLight: `${base}/logo.svg`,
            srcDark: `${base}/logo-inverse.svg`,
        },
        logoText: {
            alt: 'extended mind logo with text',
            srcLight: `${base}/logo-text.svg`,
            srcDark: `${base}/logo-text-inverse.svg`,
        },
    };
    const icon = icons[name];
    if (!icon.src) {
        icon.src = useDarkTheme ? icon.srcDark : icon.srcLight;
    }
</script>

<img alt={icon.alt} class={$$props.class} src={icon.src} />
