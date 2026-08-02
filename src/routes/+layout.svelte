<script lang="ts">
	import LayoutHeader from '$lib/components/LayoutHeader.svelte';
	import '$lib/assets/styles/global.scss';
	import { onMount } from 'svelte';
	import Lenis from 'lenis';
	import { setScrollDirection } from '$lib/stores/layout';
	let { data, children } = $props();

	const headerImages = $derived(
		(data?.settings?.images ?? []).filter((image): image is AssetImage => image != null)
	);

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
<main>
	{@render children()}
</main>
