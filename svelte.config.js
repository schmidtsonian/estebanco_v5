import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		vitePreprocess({
			style: true, // default value
			script: false // default value
		})
	],
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		paths: { relative: false },
		adapter: adapter(),

		alias: {
			$lib: 'src/lib',
			'$storyblok/components': '.storyblok/types/294253138812576/storyblok-components.d.ts',
			'$storyblok/types': '.storyblok/types/storyblok.d.ts',
			'$storyblok/api': './src/lib/storyblok/api.ts',

			$convert: 'src/lib/utils/storyblok-converters.ts'
		}
	}
};

export default config;
