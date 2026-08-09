<script lang="ts">
	import { onDestroy } from 'svelte';
	import { animate, JSAnimation, onScroll } from 'animejs';

	import { fromStore } from 'svelte/store';
	import { scale } from 'svelte/transition';
	import { layout } from '$lib/stores/layout';
	import AtomStoryblokImage from '$lib/components/AtomStoryblokImage.svelte';

	type Props = {
		marqueeTop: { _uid: string; text: string }[];
		items: {
			_uid: string;
			title?: string;
			description?: string;
			assets?: (AssetImage | Asset)[];
		}[];
	};

	let { items, marqueeTop }: Props = $props();
	let elButtons: HTMLElement[] = $state([]);
	let elMarqueeTop: HTMLElement | null = $state(null);
	let elMarqueeTopContent: HTMLElement | null = $state(null);

	let animateInstances: JSAnimation[] = $state([]);
	let layoutValue = fromStore(layout);
	let loadingAssets = $state(new Set<string>());

	let isSplashCompleted = $derived(layoutValue.current.splash.isCompleted);
	let splashTimeout: ReturnType<typeof setTimeout> | null = null;

	let assetsContainerRotation = $derived(0);
	let activeItem = $state(-1);
	let activeAssetIndices = $state<Record<number, number>>({});

	let itemsAssetsActive: { total: number; indexActive: number }[] = $derived.by(() => {
		return items.map((item, index) => {
			return { total: item.assets?.length ?? 0, indexActive: activeAssetIndices[index] ?? 0 };
		});
	});

	const loadingTimeouts: Record<string, ReturnType<typeof setTimeout>> = {};

	const MARQUEE_REPEATS = 3;
	const marqueeTopContent = $derived(
		Array.from({ length: MARQUEE_REPEATS }, (_, i) => i).flatMap(() => marqueeTop)
	);

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

	const initializeAnimations = () => {
		if (elMarqueeTop && elMarqueeTopContent) {
			const maxScroll = elMarqueeTopContent.scrollWidth - elMarqueeTop.clientWidth;

			animateInstances.push(
				animate(elMarqueeTop, {
					scrollLeft: [0, maxScroll],
					duration: 0,
					autoplay: onScroll({
						enter: 'max bottom',
						leave: 'min bottom',
						sync: 1
					})
				})
			);
		}

		elButtons.forEach((button) => {
			animateInstances.push(
				animate(button, {
					autoplay: onScroll({
						enter: 'center top',
						leave: 'center bottom',
						sync: true,
						onEnter: () => {
							activeItem = elButtons.indexOf(button);
							rotateAssets();
						},
						onLeave: () => {
							if (activeItem === elButtons.indexOf(button)) {
								activeItem = -1;
							}
						}
					})
				})
			);
		});
	};

	const handlerProjectClick = (index: number) => {
		elButtons[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		if (itemsAssetsActive[index].total <= 1) return;

		const current = activeAssetIndices[index] ?? 0;
		if (current >= itemsAssetsActive[index].total - 1) {
			activeAssetIndices[index] = 0;
		} else {
			activeAssetIndices[index] = current + 1;
		}

		rotateAssets();
	};

	const rotateAssets = () => {
		assetsContainerRotation = assetsContainerRotation === 2 ? -2 : 2;
	};

	$effect(() => {
		if (isSplashCompleted) {
			splashTimeout = setTimeout(() => {
				initializeAnimations();
			}, 500);
		}
	});

	onDestroy(() => {
		if (splashTimeout) clearTimeout(splashTimeout);
		Object.values(loadingTimeouts).forEach((timeout) => clearTimeout(timeout));
		animateInstances.forEach((instance) => instance.pause());
	});
</script>

<div class="o-list-works" class:has-intro={isSplashCompleted}>
	{#if marqueeTop && marqueeTop.length > 0}
		<div class="o-list-works__intro h-strong" bind:this={elMarqueeTop}>
			<div class="o-list-works__intro__content" bind:this={elMarqueeTopContent}>
				{#each marqueeTopContent as item, index (index)}
					<span>{item.text}</span>
					{#if index < marqueeTopContent.length - 1}
						<span class="symbol">▲</span>
					{/if}
				{/each}
			</div>
		</div>
	{/if}
	{#if items.length === 0}
		<p>No items found.</p>
	{:else}
		<ul class="o-list-works__list">
			{#each items as item, index (`${item._uid}-${index}`)}
				<li class="o-list-works__item">
					<button
						class="o-list-works__item-button"
						class:is-active={activeItem === index}
						style="--delay: {index * 0.05}s"
						onclick={() => handlerProjectClick(index)}
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
					</button>
				</li>
			{/each}
		</ul>

		{#if activeItem !== -1}
			<aside
				class="o-list-works__assets"
				in:scale|global={{ duration: 150, start: 0.94, opacity: 0 }}
				out:scale|global={{ duration: 150, start: 0.94, opacity: 0 }}
				style="--rotation: {assetsContainerRotation}deg"
			>
				{#each items as item, index (`${item._uid}-${index}`)}
					{#if activeItem === index}
						{#each item.assets ?? [] as asset, assetIndex (`${item._uid}-${asset.id}-${assetIndex}`)}
							{#if itemsAssetsActive[index].indexActive == assetIndex}
								{@const assetKey = `${item._uid}-${asset.id}-${assetIndex}`}
								{@const isLoading = loadingAssets.has(assetKey)}
								<div
									class="o-list-works__assets-item"
									in:scale|global={{ duration: 500, start: 0.94, opacity: 1 }}
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
							{/if}
						{/each}

						{#if itemsAssetsActive[index].total > 1}
							<div class="o-list-works__assets-counter">
								{itemsAssetsActive[index].indexActive + 1}
								/
								{itemsAssetsActive[index].total}
								({item.assets?.[itemsAssetsActive[index].indexActive]?.type === 'asset-image'
									? 'image'
									: 'video'})
							</div>
						{/if}
					{/if}
				{/each}
			</aside>
		{/if}
	{/if}
</div>

<style lang="scss">
	@use '$lib/assets/styles/mixins' as *;
	@use '$lib/assets/styles/functions' as *;
	@use '$lib/assets/styles/scss-vars' as *;
	.o-list-works {
		padding-top: 50vh;
	}
	.o-list-works__intro {
		overflow-x: auto;
		overflow-y: hidden;
		width: 100%;
		display: flex;
		scroll-behavior: auto;
		padding-bottom: px-to-rem(200);
		transform: rotate(-4deg);

		/* Hide scrollbar */
		scrollbar-width: none;
		&::-webkit-scrollbar {
			display: none;
		}
	}
	.o-list-works__intro__content {
		display: flex;
		align-items: center;
		gap: px-to-rem(30);
		will-change: transform;
		white-space: nowrap;
		flex-shrink: 0;

		span {
			display: inline-block;
			flex-shrink: 0;
			transition: opacity 0.3s ease;
		}

		.symbol {
			font-size: 0.35em;
		}
	}
	.o-list-works__list {
		position: relative;
		z-index: 1;
		padding-bottom: 50vh;
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
	.o-list-works__intro,
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

	.o-list-works__intro {
		transform: rotate(-4deg) translateX(-100%);
	}

	.o-list-works__item-desc {
		padding-left: 1rem;
	}

	.has-intro {
		.o-list-works__intro {
			transform: rotate(-4deg) translateX(0%);
		}
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
		right: 5%;
		transform: rotate(var(--rotation, 0deg));
		transform-origin: center right;
		transition: transform 0.5s var(--ease-in-out-custom);

		pointer-events: none;
	}

	.o-list-works__assets-counter {
		text-align: center;
		position: absolute;
		z-index: 1;
		bottom: 5vh;
		display: block;
		text-align: center;
		width: 100%;
	}

	.o-list-works__assets-item {
		display: flex;
		justify-content: center;
		align-items: center;
		inset: 0;
		max-width: 100%;
		max-height: 100%;
		pointer-events: none;
		position: absolute;
		top: 0;
		left: 0;
	}

	.o-list-works__assets-item__loader-wrapper {
		position: absolute;
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
		z-index: 2;
		color: var(--color-light, #fff);
		pointer-events: none;
	}

	.o-list-works__assets-item__media,
	:global(.o-list-works__assets-item__media) {
		border-radius: px-to-rem(10);
		overflow: hidden;
		background-color: var(--color-dark);
		width: 100%;
		object-fit: contain;
		pointer-events: none;
		z-index: 1;
	}

	video.o-list-works__assets-item__media {
		aspect-ratio: 16 / 9;
		border-radius: px-to-rem(10);
	}

	@media (min-width: 1024px) {
		.o-list-works__item-content {
			width: 50%;
		}
	}
</style>
