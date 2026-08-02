export default function clearSlashes(text: string): string {
	return text.toString().replace(/\/$/, '').replace(/^\//, '').replace('home', '');
}
