import { PUBLIC_STORYBLOK_ACCESS_TOKEN } from '$env/static/public';
import { PUBLIC_ENV_HOST } from '$env/static/public';

import { storyblokAPI } from '$lib/storyblok/api';

/** Reuse a successful `cdn/spaces/me` result for this many ms (per Node process; not shared between workers). */
const CACHE_MS = 20_000;

export type StoryblokSpace = {
	version: number;
	languageCodes: string[];
};

type Cache = { space: StoryblokSpace; at: number };
let cache: Cache | undefined;

/**
 * [Current space](https://www.storyblok.com/docs/api/content-delivery/v2/spaces/retrieve-current-space) —
 * `space.version` is the CDN `cv` for `cdn/stories` requests.
 */
export const fetchStoryblokSpace = async (): Promise<StoryblokSpace | null> => {
	if (!PUBLIC_STORYBLOK_ACCESS_TOKEN) return null;

	// If PUBLIC_ENV_HOST is not production, we don't want to cache the space version because it may change frequently (e.g. when using draft content).
	if (PUBLIC_ENV_HOST !== 'production') {
		return fetchSpaceFromApi();
	}

	const now = Date.now();
	if (cache && now - cache.at < CACHE_MS) {
		return cache.space;
	}

	const space = await fetchSpaceFromApi();
	if (!space) return null;

	cache = { space, at: now };
	return space;
};

export const fetchStoryblokSpaceVersion = async (): Promise<number | undefined> =>
	(await fetchStoryblokSpace())?.version;

const fetchSpaceFromApi = async (): Promise<StoryblokSpace | null> => {
	try {
		const { data } = await storyblokAPI.get('cdn/spaces/me', {});
		return parseSpace(data);
	} catch (e) {
		if (import.meta.env.DEV) {
			console.warn('[storyblok] fetchStoryblokSpace', e);
		}
		return null;
	}
};

const parseSpace = (data: unknown): StoryblokSpace | null => {
	const raw = (data as { space?: { version?: unknown; language_codes?: string[] } } | null)?.space;
	if (raw == null || typeof raw.version !== 'number' || !Number.isFinite(raw.version)) {
		return null;
	}
	return { version: raw.version, languageCodes: raw.language_codes ?? [] };
};
