<script lang="ts">
	import { PUBLIC_ENV_HOST } from '$env/static/public';

	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { setScrollDirection } from '$lib/stores/layout';
	import LayoutCursor from '$lib/components/LayoutCursor.svelte';
	import LayoutHeader from '$lib/components/LayoutHeader.svelte';
	import Lenis from 'lenis';
	import { globals } from '$lib/stores/globals';
	import '$lib/assets/styles/global.scss';

	let { children } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});

	onMount(() => {
		const lenis = new Lenis({
			autoRaf: true
		});

		lenis.on('scroll', (e: { direction: number }) => {
			setScrollDirection(e.direction >= 0 ? 'down' : 'up');
		});

		return () => {
			lenis.destroy();
		};
	});
</script>

<svelte:head>
	{#if PUBLIC_ENV_HOST === 'production' && $globals?.enable_tracking && $globals?.umami_js_src && $globals?.umami_website_id}
		<script defer src={$globals.umami_js_src} data-website-id={$globals.umami_website_id}></script>
	{/if}
</svelte:head>

<LayoutHeader images={$globals?.images} />
<LayoutCursor />
<main>
	{@render children()}
</main>
