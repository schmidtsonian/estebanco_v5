import type { LayoutLoad } from './$types';

import { apiPlugin, storyblokInit } from '@storyblok/svelte';
import { PUBLIC_STORYBLOK_ACCESS_TOKEN, PUBLIC_ENV_HOST } from '$env/static/public';

// import { setStoryblokCv } from '$stores/storyblokCv';
// import { setGlobals } from '$stores/globals';

export const trailingSlash = 'never';

export const load: LayoutLoad = async ({ data }) => {
	// setStoryblokCv(data.storyblokCv);
	// setGlobals(data.globals || null);

	storyblokInit({
		accessToken: PUBLIC_STORYBLOK_ACCESS_TOKEN,
		bridge: PUBLIC_ENV_HOST === 'development',
		apiOptions: { region: 'eu' },
		use: [apiPlugin],
		components: {}
	});
	return data;
};
