import { PUBLIC_ENV_HOST } from '$env/static/public';
import { storyblokAPI } from '$lib/storyblok/api';
import { fetchStoryblokSpaceVersion } from '$lib/storyblok/spaceVersion.server';

import type { Settings, Image } from '$storyblok/components';
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

	const settings = response?.data?.stories?.[0]?.content as Settings;

	return {
		settings: {
			images:
				settings?.images
					?.map((image: Image) => convert.storyblokAssetImageToAssetImage(image.asset))
					?.filter((image): image is AssetImage => image != null) ?? [],
			enable_tracking: settings?.enable_tracking ?? false,
			umami_js_src: settings?.umami_js_src,
			umami_website_id: settings?.umami_website_id
		},
		storyblokCv
	};
};
