import { writable, type Writable } from 'svelte/store';

/**
 * Set from root `+layout.server.ts`.
 * Child `load` functions: `await parent()` before `get(globals)`.
 * In components, use `$globals` in markup (<div attribute={$globals?.attribute_name}>).
 */
export const globals: Writable<Globals | null> = writable<Globals | null>(null);

export function setGlobals(value: Globals | null): void {
	globals.set(value ?? null);
}
