<script lang="ts">
	import { onMount } from 'svelte';
	import { fromStore } from 'svelte/store';
	import { layout } from '$lib/stores/layout';

	import lerp from '$lib/utils/lerp';
	const layoutValue = fromStore(layout);
	const isSplashCompleted = $derived(layoutValue.current.splash.isCompleted);

	let raf: { id: number | null } = $state({ id: null });
	let targetPos = $state({
		x: 0.5,
		y: 0.5
	});
	let cursor = $state({
		x: 0,
		y: 0
	});
	let isVisible = $state(false);
	let isVisibleTimeout: ReturnType<typeof setTimeout>;

	let windowBounds = $state({
		width: 0,
		height: 0
	});

	const VISIBLE_TIMEOUT = 1000;
	const DAMPING = 0.08;

	const handleMove = (e: MouseEvent) => {
		isVisible = true;

		targetPos.x = e.clientX / windowBounds.width;
		targetPos.y = e.clientY / windowBounds.height;

		clearTimeout(isVisibleTimeout);

		isVisibleTimeout = setTimeout(() => {
			isVisible = false;
		}, VISIBLE_TIMEOUT);

		if (!raf.id) {
			raf.id = requestAnimationFrame(render);
		}
	};

	const render = () => {
		cursor.x = lerp(cursor.x, targetPos.x, DAMPING);
		cursor.y = lerp(cursor.y, targetPos.y, DAMPING);
		raf.id = requestAnimationFrame(render);
	};

	onMount(() => {
		handleResize();
	});

	const handleResize = () => {
		windowBounds = {
			width: window.innerWidth,
			height: window.innerHeight
		};
	};
</script>

<svelte:window on:mousemove={handleMove} on:resize={handleResize} />

<aside
	class="l-cursor"
	class:is-visible={isVisible && isSplashCompleted}
	style:--cursor-x={cursor.x}
	style:--cursor-y={cursor.y}
>
	<span class="l-cursor__inner"></span>
</aside>

<style lang="scss">
	@use '$lib/assets/styles/functions' as *;

	.l-cursor {
		position: fixed;
		z-index: var(--z-index-cursor);
		user-select: none;
		pointer-events: none;
		transform: translate3d(
			calc(100vw * var(--cursor-x) - 50%),
			calc(100vh * var(--cursor-y) - 50%),
			0
		);

		&.is-visible .l-cursor__inner {
			opacity: 1;
		}
		view-transition-name: none;
	}

	.l-cursor__inner {
		position: absolute;
		width: px-to-rem(200);
		height: px-to-rem(200);
		top: px-to-rem(-100);
		left: px-to-rem(-100);
		background-color: var(--color-golden);
		border-radius: 100%;
		opacity: 0;
		user-select: none;
		pointer-events: none;
		filter: blur(px-to-rem(100));
		transition-property:
			opacity, transform, background-color, width, height, left, top, border-color, filter;
		transition-duration: 0.5s;
		transition-timing-function: var(--ease-custom-in-out);
	}
</style>
