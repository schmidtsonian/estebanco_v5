<script lang="ts">
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { setScrollDirection } from '$lib/stores/layout';
	import LayoutCursor from '$lib/components/LayoutCursor.svelte';
	import LayoutHeader from '$lib/components/LayoutHeader.svelte';
	import Lenis from 'lenis';
	import '$lib/assets/styles/global.scss';

	let { data, children } = $props();

	const headerImages = $derived(
		(data?.settings?.images ?? []).filter((image): image is AssetImage => image != null)
	);

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

<LayoutHeader images={headerImages} />
<LayoutCursor />
<main>
	{@render children()}
</main>
