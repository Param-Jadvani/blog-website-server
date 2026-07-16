import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const purifier = createDOMPurify(
  new JSDOM('').window as unknown as Parameters<typeof createDOMPurify>[0],
);

export const sanitizeBlogContent = (content: string): string =>
  purifier.sanitize(content, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      's',
      'blockquote',
      'pre',
      'code',
      'h1',
      'h2',
      'h3',
      'h4',
      'ul',
      'ol',
      'li',
      'a',
      'img',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
