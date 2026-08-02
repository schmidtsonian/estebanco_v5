export default function kebabCase(str: string): string {
	const transliterated = str
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/ß/g, 'ss')
		.replace(/æ/g, 'ae')
		.replace(/œ/g, 'oe');

	return transliterated
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
