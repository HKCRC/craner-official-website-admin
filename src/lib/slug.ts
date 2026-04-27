export function slugify(input: string): string {
  const result = input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  // If the input was pure non-ASCII (e.g. Chinese), fall back to a short random id
  return result || randomSlug();
}

export function randomSlug(length = 10): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, length);
}

