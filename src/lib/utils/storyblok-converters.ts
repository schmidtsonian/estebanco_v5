import type { StoryblokAsset } from '$storyblok/types';

import clearSlashes from '$lib/utils/clearSlashes';

const extractStoryblokDimensions = (src: string): { width?: string; height?: string } => {
	const match = src.match(/\/(\d+)x(\d+)\//);

	return {
		width: match?.[1],
		height: match?.[2]
	};
};

const storyblokAssetToAsset = (assetObject?: StoryblokAsset): Asset | undefined => {
	if (!assetObject || !assetObject.filename) {
		return undefined;
	}

	return {
		type: 'asset',
		id: assetObject.id,
		src: assetObject.filename,
		title: assetObject.title || ''
	};
};

const storyblokAssetImageToAssetImage = (assetObject?: StoryblokAsset): AssetImage | undefined => {
	if (!assetObject || !assetObject.filename) {
		return undefined;
	}

	const asset = storyblokAssetToAsset(assetObject);
	const image = {
		...asset,
		type: 'asset-image'
	} as AssetImage;
	const dimensions = extractStoryblokDimensions(image.src);

	image.width = image.width || dimensions.width || '';
	image.height = image.height || dimensions.height || '';
	image.alt = assetObject.alt || '';
	image.focus = assetObject.focus || '';

	return image;
};

export default {
	storyblokAssetToAsset,
	storyblokAssetImageToAssetImage,
	clearSlashes
};

/**
 * Naming conventions:
 * - transform: manipulates data (broad operation)
 * - convert: transforms data from one format to another, often for compatibility or integration purposes
 * - map: creates a new data structure by transforming from one format to another (XToY converter pattern)
 *
 * Note: href validation is safe—clearSlashes removes "home" entirely, so /home → / not /home.
 */
