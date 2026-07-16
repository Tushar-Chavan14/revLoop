/**
 * Themed stock photography for surfaces that don't have a real uploaded photo
 * yet (destinations with no cover, empty rider galleries, marketing sections).
 * `lock` pins a specific photo so the same call always renders the same
 * image instead of a new random one on every request.
 */
export function themedPhoto(keywords: string, lock: number, width = 1200, height = 800) {
  return `https://loremflickr.com/${width}/${height}/${keywords}/all?lock=${lock}`;
}
