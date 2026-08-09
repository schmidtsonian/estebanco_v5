import type { RequestHandler } from './$types';
import { storyblokAPI } from '$lib/storyblok/api';
import { PUBLIC_ENV_HOST } from '$env/static/public';

import type { Robots } from '$storyblok/components';

import { fetchStoryblokSpaceVersion } from '$lib/storyblok/spaceVersion.server';

export const config = {
	isr: PUBLIC_ENV_HOST === 'production' ? { expiration: 300 } : undefined // Auto-revalidate after 300 seconds (5 minutes)
};

export const GET: RequestHandler = async () => {
	const version = PUBLIC_ENV_HOST === 'production' ? 'published' : 'draft';
	const storyblokCv = await fetchStoryblokSpaceVersion();

	const response = await storyblokAPI
		.get('cdn/stories', {
			version,
			content_type: 'robots',
			...(storyblokCv != null && { cv: storyblokCv })
		})
		.catch((error) => {
			console.error('Error fetching globals from Storyblok:', error);
			return null;
		});

	if (!response) {
		return new Response('', {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' }
		});
	}

	const robots = response?.data?.stories?.[0]?.content as Robots;

	return new Response(robots.content ?? '', {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
};
