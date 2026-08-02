<script lang="ts">
	import { resolve } from '$app/paths';
	import { fromStore } from 'svelte/store';
	import { layout } from '$lib/stores/layout';
	import AtomLogoEstebanco from '$lib/components/AtomLogoEstebanco.svelte';
	import AtomStoryblokImage from '$lib/components/AtomStoryblokImage.svelte';
	import { animate, createTimeline, stagger } from 'animejs';

	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { setSplashCompleted } from '$lib/stores/layout';

	let { images = [] }: { images?: AssetImage[] } = $props();
	let loadedCount = $state(0);
	let hasAnimated = $state(false);
	let previousImageCount = $state(-1);
	let elHeader: HTMLElement | null = $state(null);
	let elImages: HTMLElement[] = $state([]);
	let elSplash: HTMLElement | null = $state(null);
	let elProgress: HTMLElement | null = $state(null);
	let progressPercent = $state(0);
	let canLoadImages = $state(false);
	const handledImageIndexes = new SvelteSet<number>();
	const layoutValue = fromStore(layout);

	const runIntroAnimation = () => {
		if (hasAnimated) return;
		if (!elSplash || !elHeader || !elProgress) return;
		const visibleImages = elImages.filter((image): image is HTMLElement => image != null);
		if (visibleImages.length === 0) return;

		hasAnimated = true;
		const imageDuration = 450;
		const imageStep = 250;
		const getDelay = stagger(imageStep);

		const timeline = createTimeline({
			onComplete: () => {
				if (elSplash) {
					elSplash.style.display = 'none';
				}
			}
		});

		timeline
			.add(elProgress, {
				opacity: [1, 0],
				duration: 350,
				ease: 'inOutCirc'
			})
			.add(visibleImages, {
				opacity: 1,
				duration: imageDuration,
				delay: getDelay,
				ease: 'inCirc'
			})
			.add(elSplash, {
				opacity: [1, 0],
				scale: [1, 1.05],
				rotate: [0, 0.5],
				duration: 350,
				delay: 500,
				ease: 'inOutCirc'
			})
			.add(
				elHeader,
				{
					height: [elHeader?.offsetHeight ?? 54, 100],
					delay: 0.5,
					duration: 750,
					ease: 'inOutCirc',
					onBegin: () => {
						if (elSplash) {
							setSplashCompleted(true);
						}
					}
				},
				'<<'
			);
	};

	const handleImageReady = (index: number) => {
		if (images.length === 0) return;
		if (handledImageIndexes.has(index)) return;
		handledImageIndexes.add(index);

		loadedCount = Math.min(images.length, loadedCount + 1);
		const targetPercent = Math.min(
			100,
			Math.max(0, Math.round((loadedCount / images.length) * 100))
		);
		const progressTween = { value: progressPercent };
		animate(progressTween, {
			value: targetPercent,
			duration: 1000,
			ease: 'inCirc',
			onUpdate: () => {
				progressPercent = Math.round(progressTween.value);
				if (progressPercent >= 100) {
					runIntroAnimation();
				}
			}
		});
		if (elProgress) {
			animate(elProgress, {
				height: [`${100 - progressPercent}%`, `${100 - targetPercent}%`],
				duration: 1000,
				ease: 'inCirc'
			});
		}
	};

	onMount(() => {
		if (!elHeader) {
			canLoadImages = true;
			if (images.length === 0) runIntroAnimation();
			return;
		}

		animate(elHeader, {
			opacity: [0, 1],
			duration: 750,
			ease: 'inOutCirc',
			onComplete: () => {
				canLoadImages = true;
				if (images.length === 0) {
					runIntroAnimation();
				}
			}
		});
	});

	$effect(() => {
		const count = images.length;
		if (count === previousImageCount) return;

		previousImageCount = count;
		loadedCount = 0;
		hasAnimated = false;
		handledImageIndexes.clear();

		if (count === 0 && canLoadImages) {
			runIntroAnimation();
		}
	});
</script>

<aside class="l-splash" bind:this={elSplash}>
	<div class="l-splash__images">
		{#if canLoadImages}
			{#each images as image, index (image.id)}
				<div class="l-splash__image" bind:this={elImages[index]}>
					<AtomStoryblokImage
						src={image.src}
						width={1920}
						height={1080}
						layout="fixed"
						fetchpriority="high"
						loading="eager"
						onload={() => handleImageReady(index)}
						onerror={() => handleImageReady(index)}
						class="l-splash__asset"
					/>
				</div>
			{/each}
		{/if}
	</div>
	<div class="l-splash__percentage" bind:this={elProgress}>
		<p class="h-h5">
			{progressPercent}%
		</p>
	</div>
</aside>
<header class="l-headers" bind:this={elHeader}>
	<a
		href={resolve('/')}
		class={[
			'l-headers__logo-link',
			{
				up: layoutValue.current.scrollDirection === 'up',
				down: layoutValue.current.scrollDirection === 'down'
			}
		]}
		aria-label="Go to home"
	>
		<AtomLogoEstebanco class="l-headers__logo" />
	</a>
</header>

<style lang="scss">
	@use '$lib/assets/styles/mixins' as *;
	@use '$lib/assets/styles/functions' as *;
	@use '$lib/assets/styles/scss-vars' as *;

	.l-splash,
	.l-splash__images,
	.l-splash__image,
	.l-headers,
	:global(.l-splash__asset) {
		position: fixed;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
	}

	.l-splash__percentage {
		width: 100%;
		position: absolute;
		bottom: 0;
		left: 0;
		height: 100%;
		isolation: isolate;
		z-index: 10;
		background-color: var(--color-dark);

		p {
			color: var(--color-light);
			padding: 1rem;
			transform: translateY(-100%);
		}
	}

	.l-splash__image {
		opacity: 0;
		&:nth-child(1) {
			opacity: 1;
		}
	}

	:global(.l-splash__asset) {
		width: 100% !important;
		height: 100% !important;
	}

	.l-headers {
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10;
		mix-blend-mode: difference;
		isolation: isolate;
		opacity: 0;
	}

	:global(.l-headers__logo) {
		width: px-to-rem(200);
		height: px-to-rem(54);
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		margin: auto;
		color: var(--color-light);
	}

	.l-headers__logo-link {
		display: inline-block;
		width: px-to-rem(200);
		height: px-to-rem(54);
		transform: scale(1) translateY(0%);
		transition: transform 0.5s var(--ease-in-out-custom);
		&.up {
			transform: scale(1) translateY(0%);
		}
		&.down {
			transform: scale(0.55) translateY(-60%);
		}
	}
</style>
