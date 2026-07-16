import { randomBytes } from 'node:crypto';

/**
 * Generate a random username (e.g. user-abc123)
 */
export const generateUsername = (): string => {
  const usernamePrefix = 'user-';
  const randomChars = randomBytes(9).toString('base64url');

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

  const randomSlug = randomBytes(3).toString('hex');
  const uniqueSlug = `${slug}-${randomSlug}`;

  return uniqueSlug;
};
