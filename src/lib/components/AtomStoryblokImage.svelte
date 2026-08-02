<script lang="ts">
	import { Image, type ImageProps } from '@unpic/svelte';
	import { transform } from 'unpic/providers/storyblok';

	/**
	 * More about @unpic/svelte image props: https://unpic.pics/img/svelte/#image-props
	 * More about Storyblok transformer options: https://unpic.pics/providers/storyblok/
	 */
	type Props = ImageProps & {
		src: string;
		focus?: string; // Storyblok focal point, e.g. "0.5x0.5"
		class?: string;
		layout?: 'constrained' | 'fullWidth' | 'fixed'; // https://unpic.pics/img/svelte/#layout
	};

	let { src, focus, ...rest }: Props = $props();
</script>

{#if src}
	<Image
		{src}
		transformer={transform}
		{...rest}
		operations={focus
			? {
					storyblok: {
						filters: {
							focal: focus
						}
					}
				}
			: undefined}
	/>
{/if}
