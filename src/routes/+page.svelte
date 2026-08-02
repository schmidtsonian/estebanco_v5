<script lang="ts">
	import { fromStore } from 'svelte/store';
	import { layout } from '$lib/stores/layout';

	const layoutValue = fromStore(layout);
	const isSplashCompleted = $derived(layoutValue.current.splash.isCompleted);
</script>

<section class={[{ 'has-intro': isSplashCompleted }]}>
	<h2 class="h-h2">
		<span><span>Este banco</span></span>
		<span><span>está ocupado...</span></span>
	</h2>
</section>

<style lang="scss">
	section {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}
	h2 {
		margin: 0;
		> span {
			overflow: hidden;
		}
	}
	span {
		display: block;
	}
	span span {
		transform: translateY(200%);
		transition: transform 0.75s var(--ease-in-out-custom);
	}

	.has-intro {
		h2 {
			span span {
				transform: translateY(0%);
			}
			span:nth-child(2) span {
				transition-delay: 0.25s;
			}
		}
	}
</style>
