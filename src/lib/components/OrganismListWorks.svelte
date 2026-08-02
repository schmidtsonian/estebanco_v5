<script lang="ts">
	import { fromStore } from 'svelte/store';
	import { fade, fly } from 'svelte/transition';
	import { layout } from '$lib/stores/layout';
	import AtomStoryblokImage from '$lib/components/AtomStoryblokImage.svelte';

	type Props = {
		items: {
			_uid: string;
			title?: string;
			description?: string;
			assets?: (AssetImage | Asset)[];
		}[];
	};

	let { items }: Props = $props();
	const layoutValue = fromStore(layout);
	const isSplashCompleted = $derived(layoutValue.current.splash.isCompleted);

	let visibleIndex = $state(-1);
</script>

<div class={['o-list-works', { 'has-intro': isSplashCompleted }]}>
	{#if items.length === 0}
		<p>No items found.</p>
	{:else}
		<ul class="o-list-works__list">
			{#each items as item, index (`${item._uid}-${index}`)}
				<li class="o-list-works__item">
					<button
						class={[
							'o-list-works__item-button',
							{ 'is-active': visibleIndex === index },
							{ 'is-idle': visibleIndex === -1 }
						]}
						style="--delay: {index * 0.05}s"
						onmouseenter={() => (visibleIndex = index)}
					>
						<div class="o-list-works__item-content">
							<h2 class="h-h1 o-list-works__item-title">
								<span class="o-list-works__item-arrow">→</span>{item.title}
							</h2>
							{#if item.description}
								<p class="h-strong o-list-works__item-desc">{item.description}</p>
							{/if}
						</div>
					</button>
				</li>
			{/each}
		</ul>

		{#each items as item, index (`${item._uid}-${index}`)}
			{#if visibleIndex === index}
				<aside
					class={[
						'o-list-works__assets',
						`o-list-works__assets--${item.assets ? item.assets.length : 0}`
					]}
				>
					{#each item.assets ?? [] as asset, assetIndex (`${item._uid}-${asset.id}-${assetIndex}`)}
						<div
							class="o-list-works__assets-item"
							in:fly|global={{ duration: 300, x: 100, delay: assetIndex * 100 }}
							out:fade|global={{ duration: 100 }}
						>
							{#if asset.type === 'asset-image'}
								<AtomStoryblokImage
									src={asset.src}
									width={1920}
									height={1080}
									focus={asset.focus}
									class="o-list-works__assets-item__media"
								/>
							{:else if asset.type === 'asset'}
								<video
									src={asset.src}
									autoplay
									loop
									muted
									playsinline
									class="o-list-works__assets-item__media"
								></video>
							{/if}
						</div>
					{/each}
				</aside>
			{/if}
		{/each}
	{/if}
</div>

<style lang="scss">
	@use '$lib/assets/styles/mixins' as *;
	@use '$lib/assets/styles/functions' as *;
	@use '$lib/assets/styles/scss-vars' as *;
	.o-list-works__list {
		position: relative;
		z-index: 1;
	}
	.o-list-works__item {
		overflow: hidden;
		position: relative;
		padding-inline: 1rem;
	}

	.o-list-works__item-button {
		width: 100%;
		transform: translateY(200%);
		transition-property: transform, opacity;
		transition-duration: 0.75s;
		transition-timing-function: var(--ease-in-out-custom);
		padding-block: 4rem;
	}
	.o-list-works__item-arrow,
	.o-list-works__item-title,
	.o-list-works__item-desc {
		transition-property: transform;
		transition-duration: 0.5s;
		transition-timing-function: var(--ease-in-out-custom);
	}
	.o-list-works__item-arrow {
		transition-property: transform, opacity;
		position: absolute;
		opacity: 0;
		transform: translateX(-100%);
	}

	.o-list-works__item-desc {
		padding-left: 1rem;
	}

	.has-intro {
		.o-list-works__item-button {
			transition-delay: var(--delay) 0s;
			transform: translateY(0%);
		}
	}

	.o-list-works__item-button.is-active {
		.o-list-works__item-title,
		.o-list-works__item-desc {
			transform: translateX(10%);
		}

		.o-list-works__item-arrow {
			opacity: 1;
			transform: translateX(-110%);
		}

		.o-list-works__item-desc {
			transition-delay: 0.1s;
		}
	}

	.o-list-works__item-button:not(.is-active):not(.is-idle) {
		opacity: 0.5;
		transition-duration: 0.5s !important;
		transition-delay: 0s !important;
	}

	.o-list-works__assets {
		position: fixed;
		display: flex;
		inset: 0;
		width: 50%;
		margin-left: auto;
		flex-direction: column;
		justify-content: center;
		gap: 2rem;
		padding: 2rem;
		pointer-events: none;
	}

	.o-list-works__assets-item {
		display: flex;
		justify-content: center;
		align-items: center;
		inset: 0;
		max-width: 100%;
		max-height: 100%;
		pointer-events: none;
	}

	.o-list-works__assets-item__media,
	:global(.o-list-works__assets-item__media) {
		border-radius: px-to-rem(8);
		overflow: hidden;
		background-color: var(--color-dark);
		width: 100%;
		aspect-ratio: 16 / 9;
		object-fit: contain;
		pointer-events: none;
		z-index: 1;
	}

	@media (min-width: 1024px) {
		.o-list-works__item-content {
			width: 50%;
		}
	}
	@media (min-width: 1900px) {
		.o-list-works__assets--3 {
			width: 40%;
		}
	}
	@media (min-width: 2200px) {
		.o-list-works__assets--2 {
			width: 35%;
		}
		.o-list-works__assets--3 {
			width: 30%;
		}
	}

	@media (min-width: 2600px) {
		.o-list-works__assets--2 {
			width: 30%;
		}
		.o-list-works__assets--3 {
			width: 20%;
		}
	}
</style>
