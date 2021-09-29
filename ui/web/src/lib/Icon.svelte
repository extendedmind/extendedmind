<script lang="ts">
    export let name: string;
    const useDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const icons = {
        logo: {
            alt: 'extended mind logo',
            srcLight: 'logo.svg',
            srcDark: 'logo-inverse.svg',
        },
        logoText: {
            alt: 'extended mind logo with text',
            srcLight: 'logo-text.svg',
            srcDark: 'logo-text-inverse.svg',
        },
    };
    const icon = icons[name];
    if (!icon.src) {
        icon.src = useDarkTheme ? icon.srcDark : icon.srcLight;
    }
</script>

<img alt={icon.alt} class={$$props.class} src={icon.src} />
