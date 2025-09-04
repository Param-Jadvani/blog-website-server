/**
 * Generate a random username (e.g. user-abc123)
 */
export const generateUsername = (): string => {
  const usernamePrefix = 'user-';
  const randomChars = Math.random().toString(36).slice(2);

  const username = usernamePrefix + randomChars;

  return username;
};

/**
 * Generate a random slug from a title (e.g. my-title-abc-123)
 * @param title the title to generate a slug from
 * @returns a random slug
 */
export const generateSlug = (title: string): string => {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens

  const randomSlug = Math.random().toString(36).slice(2, 8); // 6-char suffix
  const uniqueSlug = `${slug}-${randomSlug}`;

  return uniqueSlug;
};
