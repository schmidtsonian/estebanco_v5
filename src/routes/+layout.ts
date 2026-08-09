import type { LayoutLoad } from './$types';
import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

import { apiPlugin, storyblokInit } from '@storyblok/svelte';
import { PUBLIC_STORYBLOK_ACCESS_TOKEN, PUBLIC_ENV_HOST } from '$env/static/public';

import { setStoryblokCv } from '$lib/stores/storyblokCv';
import { setGlobals } from '$lib/stores/globals';

export const trailingSlash = 'never';

export const load: LayoutLoad = async ({ data }) => {
	injectSpeedInsights();

	setStoryblokCv(data.storyblokCv);
	setGlobals(data.settings || null);

	storyblokInit({
		accessToken: PUBLIC_STORYBLOK_ACCESS_TOKEN,
		bridge: PUBLIC_ENV_HOST === 'development',
		apiOptions: { region: 'eu' },
		use: [apiPlugin],
		components: {}
	});

	return data;
};
