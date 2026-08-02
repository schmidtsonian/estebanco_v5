// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	type ContentVersion = 'draft' | 'published';
	type ScrollDirection = 'up' | 'down';

	interface Link {
		id: string;
		href: string;
		title?: string;
		'data-label'?: string;
		target?: string;
		rel?: string;
	}

	interface Asset {
		type: 'asset';
		id: number;
		src: string;
		title?: string;
	}

	interface AssetImage extends Asset {
		type: 'asset-image';
		alt?: string;
		width?: string;
		height?: string;
		focus?: string;
	}

	interface LayoutStore {
		splash: {
			isCompleted: boolean;
		};
		scrollDirection: ScrollDirection;
	}

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
