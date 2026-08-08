<script lang="ts">
	import { page } from '$app/state';
	import type { PageData } from './$types';
	import type { ISbStoryData } from '@storyblok/svelte';
	import { storyblokEditable, useStoryblokBridge } from '@storyblok/svelte';
	import type { Work } from '$storyblok/components';
	import { browser } from '$app/environment';
	import convert from '$convert';
	import OrganismListWorks from '$lib/components/OrganismListWorks.svelte';

	const { data }: { data: PageData } = $props();

	/** Live preview payload from Storyblok bridge; `undefined` means “use `data.story`” (SSR + first paint). */
	let patchedFromBridge = $state<ISbStoryData | undefined>(undefined);

	const story = $derived(patchedFromBridge ?? data.story);

	/** Avoid calling `useStoryblokBridge` on every live story payload (same id) — that would stack listeners. */
	let lastBridgeStoryId: number | null = null;

	$effect.pre(() => {
		void data.story;
		patchedFromBridge = undefined;
		if (!data.story) lastBridgeStoryId = null;
	});

	$effect(() => {
		if (!browser || !story?.id) return;
		const id = story.id;
		if (lastBridgeStoryId === id) return;
		lastBridgeStoryId = id;

		useStoryblokBridge(id, (newStory) => {
			patchedFromBridge = newStory;
		});
	});
</script>

{#key page.url.pathname}
	{#if story}
		<section use:storyblokEditable={story.content}>
			<OrganismListWorks
				marqueeTop={(story.content as Work).marquee?.map((item) => ({
					_uid: item._uid,
					text: item.text ?? '-'
				})) ?? []}
				items={(story.content as Work).works.map((work) => ({
					_uid: work._uid,
					title: work.title,
					description: work.description,
					assets: work.assets
						?.map((item) => {
							if (item.component === 'image') {
								return convert.storyblokAssetImageToAssetImage(item.asset);
							} else if (item.component === 'video') {
								return convert.storyblokAssetToAsset(item.asset);
							}
							return null;
						})
						.filter((asset): asset is AssetImage | Asset => asset !== null)
				}))}
			/>
		</section>
	{/if}
{/key}

<style lang="scss">
	@use '$lib/assets/styles/mixins' as *;
	@use '$lib/assets/styles/functions' as *;
	@use '$lib/assets/styles/scss-vars' as *;
	section {
		// margin-top: px-to-rem(100);
	}
</style>
