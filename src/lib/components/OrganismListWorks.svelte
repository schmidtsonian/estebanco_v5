<script lang="ts">
	import { onDestroy } from 'svelte';
	import { animate, JSAnimation, onScroll } from 'animejs';

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
	let elButtons: HTMLElement[] = $state([]);
	let animateInstances: JSAnimation[] = $state([]);
	let layoutValue = fromStore(layout);
	let isSplashCompleted = $derived(layoutValue.current.splash.isCompleted);
	let visibleIndex = $state(-1);
	let loadingAssets = $state(new Set<string>());
	const loadingTimeouts: Record<string, ReturnType<typeof setTimeout>> = {};
	let splashTimeout: ReturnType<typeof setTimeout> | null = null;

	const addLoadingAsset = (assetKey: string) => {
		loadingAssets.add(assetKey);
		const timeout = setTimeout(() => {
			loadingAssets.delete(assetKey);
			delete loadingTimeouts[assetKey];
		}, 8000);
		loadingTimeouts[assetKey] = timeout;
	};

	const removeLoadingAsset = (assetKey: string) => {
		loadingAssets.delete(assetKey);
		if (loadingTimeouts[assetKey]) {
			clearTimeout(loadingTimeouts[assetKey]);
			delete loadingTimeouts[assetKey];
		}
	};

	$effect(() => {
		if (isSplashCompleted) {
			splashTimeout = setTimeout(() => {
				initializeAnimations();
			}, 500);
		}
	});

	const initializeAnimations = () => {
		elButtons.forEach((button) => {
			animateInstances.push(
				animate(button, {
					autoplay: onScroll({
						enter: 'center top',
						leave: 'center bottom',
						sync: true,
						onEnter: () => {
							visibleIndex = elButtons.indexOf(button);
						}
					})
				})
			);
		});
	};
	onDestroy(() => {
		if (splashTimeout) clearTimeout(splashTimeout);
		Object.values(loadingTimeouts).forEach((timeout) => clearTimeout(timeout));
		animateInstances.forEach((instance) => instance.pause());
	});
</script>

<div class="o-list-works" class:has-intro={isSplashCompleted}>
	{#if items.length === 0}
		<p>No items found.</p>
	{:else}
		<ul class="o-list-works__list">
			{#each items as item, index (`${item._uid}-${index}`)}
				<li class="o-list-works__item">
					<div
						class="o-list-works__item-button"
						class:is-active={visibleIndex === index}
						style="--delay: {index * 0.05}s"
						bind:this={elButtons[index]}
					>
						<div class="o-list-works__item-content">
							<h2 class="h-h1 o-list-works__item-title">
								<span class="o-list-works__item-arrow">→</span>{item.title}
							</h2>
							{#if item.description}
								<p class="h-strong o-list-works__item-desc">{item.description}</p>
							{/if}
						</div>
					</div>
				</li>
			{/each}
		</ul>

		{#each items as item, index (`${item._uid}-${index}`)}
			{#if visibleIndex === index && isSplashCompleted}
				<aside
					class={[
						'o-list-works__assets',
						`o-list-works__assets--${item.assets ? item.assets.length : 0}`
					]}
				>
					{#each item.assets ?? [] as asset, assetIndex (`${item._uid}-${asset.id}-${assetIndex}`)}
						{@const assetKey = `${item._uid}-${asset.id}-${assetIndex}`}
						{@const isLoading = loadingAssets.has(assetKey)}
						<div
							class="o-list-works__assets-item"
							in:fly|global={{ duration: 300, x: 100, delay: assetIndex * 100 }}
							out:fade|global={{ duration: 100 }}
						>
							{#if asset.type === 'asset-image'}
								<div class="o-list-works__assets-item__loader-wrapper">
									<AtomStoryblokImage
										src={asset.src}
										width={Number(asset.width) || 1920}
										height={Number(asset.height) || 1080}
										style="aspect-ratio: {asset.width && asset.height
											? `${asset.width} / ${asset.height}`
											: '1920 / 1080'};"
										breakpoints={[]}
										focus={asset.focus}
										class="o-list-works__assets-item__media"
										onload={() => removeLoadingAsset(assetKey)}
										onerror={() => removeLoadingAsset(assetKey)}
									/>
									{#if isLoading}
										<div class="o-list-works__assets-item__loader">
											<span>loading ...</span>
										</div>
									{/if}
								</div>
							{:else if asset.type === 'asset'}
								<div class="o-list-works__assets-item__loader-wrapper">
									<video
										src={asset.src}
										autoplay
										loop
										muted
										playsinline
										class="o-list-works__assets-item__media"
										onloadstart={() => addLoadingAsset(assetKey)}
										oncanplay={() => removeLoadingAsset(assetKey)}
										onerror={() => removeLoadingAsset(assetKey)}
									></video>
									{#if isLoading}
										<div class="o-list-works__assets-item__loader">
											<span>loading ...</span>
										</div>
									{/if}
								</div>
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
	.o-list-works {
		padding-top: 75vh;
		padding-bottom: 50vh;
	}
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
		transition-duration: 0.5s;
		transition-timing-function: var(--ease-in-out-custom);
		padding-block: 4rem;

		opacity: 0.5;
		transition-delay: 0.15s;
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
		opacity: 1;
		transition-delay: 0s !important;
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

	.o-list-works__assets {
		position: fixed;
		display: flex;
		inset: 0;
		width: 50%;
		margin-left: auto;
		flex-direction: column;
		justify-content: center;
		gap: 0.5rem;
		right: -2rem;
		// padding: 2rem;
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

	.o-list-works__assets-item__loader-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.o-list-works__assets-item__loader {
		position: absolute;
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: px-to-rem(8);
		z-index: 2;
		font-size: 1rem;
		color: var(--color-light, #fff);
		pointer-events: none;
	}

	.o-list-works__assets-item__media,
	:global(.o-list-works__assets-item__media) {
		border-radius: px-to-rem(6);
		overflow: hidden;
		background-color: var(--color-dark);
		width: 100%;
		object-fit: contain;
		pointer-events: none;
		z-index: 1;
	}

	video.o-list-works__assets-item__media {
		aspect-ratio: 16 / 9;
		background-color: var(--color-light);
	}

	@media (min-width: 1024px) {
		.o-list-works__item-content {
			width: 50%;
		}
	}
	@media (min-width: 1700px) {
		.o-list-works__assets--2 {
			width: 40%;
		}
		.o-list-works__assets--3 {
			width: 30%;
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
