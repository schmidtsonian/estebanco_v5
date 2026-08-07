<script lang="ts">
	import { fromStore } from 'svelte/store';
	import { layout } from '$lib/stores/layout';

	const layoutValue = fromStore(layout);
	const isSplashCompleted = $derived(layoutValue.current.splash.isCompleted);
</script>

<section class={[{ 'has-intro': isSplashCompleted }]}>
	<h2 class="h-strong">
		<span><span>Este banco</span></span>
		<span><span>está ocupado...</span></span>
		<span><span>German-based „señor“... </span></span>
		<span><span>Software engineer,</span></span>
		<span><span>Software designer,</span></span>
		<span><span>Frontend architect, </span></span>
		<span><span>Creative technologist</span></span>
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
			@for $i from 2 through 6 {
				span:nth-child(#{$i}) span {
					transition-delay: ($i - 1) * 0.06s; /* slightly tighter stagger for better flow */
				}
			}
		}
	}
</style>
