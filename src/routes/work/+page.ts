import { PUBLIC_ENV_HOST } from '$env/static/public';
import type { PageLoad } from './$types';
import type { ISbResult } from '@storyblok/svelte';
// import type { Work } from '$storyblok/components';

import { get } from 'svelte/store';
import { storyblokAPI } from '$lib/storyblok/api';
import { storyblokCv } from '$lib/stores/storyblokCv';

let cachedStoryKey: string | null = null;
let cachedResponse: ISbResult | null = null;

// TODO: if is SSR, is this needed?
export const config = {
	isr: PUBLIC_ENV_HOST === 'production' ? { expiration: 300 } : undefined // Auto-revalidate after 300 seconds (5 minutes)
};

export const load: PageLoad = async ({ setHeaders }) => {
	if (PUBLIC_ENV_HOST === 'production') {
		// Set cache headers for the page response.
		// Cache for 5 minutes (300 seconds).
		// Allow stale content while revalidating for 5 minutes.
		setHeaders({
			'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300'
		});
	}

	if (!storyblokAPI) {
		console.error('Storyblok API client is not available');
		return { story: null, content: undefined };
	}

	/**
	 * Returns the cached story if the slug hasn't changed, otherwise fetches fresh.
	 */
	const fetchStory = async (slug: string): Promise<ISbResult | null> => {
		const cv = get(storyblokCv);
		const version = PUBLIC_ENV_HOST === 'production' ? 'published' : 'draft';
		const cacheKey = `${slug}|${version}|${cv ?? 'no-cv'}`;
		const shouldUseProcessCache = PUBLIC_ENV_HOST === 'production';

		if (shouldUseProcessCache && cachedStoryKey === cacheKey && cachedResponse) {
			return cachedResponse;
		}

		const response = await storyblokAPI
			.get('cdn/stories', {
				version,
				resolve_relations: ['works.work_detail'],
				...(cv != null && { cv }),
				by_slugs: slug,
				per_page: 1,
				resolve_links: 'story'
			})
			.catch(() => {
				return null;
			});

		const story = response?.data?.stories?.[0];
		if (!story) {
			return null;
		}

		const normalisedResponse = {
			...response,
			data: {
				...response.data,
				story
			}
		} as ISbResult;

		if (normalisedResponse.data?.story) {
			if (shouldUseProcessCache) {
				cachedStoryKey = cacheKey;
				cachedResponse = normalisedResponse;
			}
			return normalisedResponse;
		}

		return null;
	};

	const fetchedStory = await fetchStory('work');

	return {
		story: fetchedStory?.data?.story
	};
};
