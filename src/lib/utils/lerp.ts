export default function lerp(start: number, end: number, amt: number): number {
  return start * (1 - amt) + end * amt
}
