import { PUBLIC_ENV_HOST } from '$env/static/public';
import { storyblokAPI } from '$lib/storyblok/api';
import { fetchStoryblokSpaceVersion } from '$lib/storyblok/spaceVersion.server';

import type { Settings } from '$storyblok/components';
import type { LayoutServerLoad } from './$types';
import convert from '$convert';

export const load: LayoutServerLoad = async () => {
	const storyblokCv = await fetchStoryblokSpaceVersion();

	// Get Globals from Storyblok
	const version = PUBLIC_ENV_HOST === 'production' ? 'published' : 'draft';
	const response = await storyblokAPI
		.get('cdn/stories', {
			version,
			resolve_links: 'story',
			content_type: 'settings',
			resolve_relations: ['settings.images'],
			...(storyblokCv != null && { cv: storyblokCv })
		})
		.catch((error) => {
			console.error('Error fetching globals from Storyblok:', error);
			return null;
		});

	if (!response) {
		return {
			storyblokCv
		};
	}

	const globals = response?.data?.stories?.[0]?.content as Settings;

	return {
		settings: {
			images:
				globals?.images?.map((image) => {
					return convert.storyblokAssetImageToAssetImage(image.asset);
				}) ?? []
		},
		storyblokCv
	};
};
