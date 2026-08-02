import { writable, type Writable } from 'svelte/store';

export const layout: Writable<LayoutStore> = writable({
	header: {
		isNavigationOpen: false
	},
	splash: {
		isCompleted: false
	},
	scrollDirection: 'up'
});

export function setSplashCompleted(isCompleted: boolean): void {
	layout.update((current) => {
		current.splash.isCompleted = isCompleted;
		return current;
	});
}

export function setScrollDirection(direction: ScrollDirection): void {
	layout.update((current) => {
		current.scrollDirection = direction;
		return current;
	});
}
