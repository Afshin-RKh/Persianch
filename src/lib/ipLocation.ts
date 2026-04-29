let cached: [number, number] | null = null;
let pending: Promise<[number, number] | null> | null = null;

export function getIPLocation(): Promise<[number, number] | null> {
  if (cached) return Promise.resolve(cached);
  if (pending) return pending;
  pending = fetch("https://ipapi.co/json/")
    .then((r) => r.json())
    .then((d) => {
      if (d.latitude && d.longitude) {
        cached = [d.latitude, d.longitude];
        return cached;
      }
      return null;
    })
    .catch(() => null);
  return pending;
}
