import { writable, type Writable } from 'svelte/store';

/**
 * Set from root `+layout` from `data.storyblokCv` (from `+layout.server`).
 * Child `load` functions must `await parent()` before `get(storyblokCv)` in the same request.
 */
export const storyblokCv: Writable<number | undefined> = writable<number | undefined>(undefined);

export function setStoryblokCv(value: number | undefined): void {
	storyblokCv.set(value);
}
