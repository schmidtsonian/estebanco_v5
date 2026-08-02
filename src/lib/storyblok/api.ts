import StoryblokClient from 'storyblok-js-client';

import { PUBLIC_STORYBLOK_ACCESS_TOKEN, PUBLIC_ENV_HOST } from '$env/static/public';

export const storyblokAPI = new StoryblokClient({
	accessToken: PUBLIC_STORYBLOK_ACCESS_TOKEN,
	region: 'eu',
	cache: {
		type: 'memory',
		clear: 'auto'
	},
	version: PUBLIC_ENV_HOST === 'production' ? 'published' : 'draft'
});
