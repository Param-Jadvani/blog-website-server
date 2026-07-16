import { generateSlug, generateUsername } from '@/utils';
import { sanitizeBlogContent } from '@/lib/sanitize';

describe('utility functions', () => {
  it('generates usernames that fit the model constraints', () => {
    const username = generateUsername();

    expect(username).toMatch(/^user-[A-Za-z0-9_-]{12}$/);
    expect(username).toHaveLength(17);
  });

  it('normalizes a title and appends a safe unique slug suffix', () => {
    expect(generateSlug('  Hello, World!  ')).toMatch(
      /^hello-world-[a-f0-9]{6}$/,
    );
  });

  it('removes executable HTML while retaining allowed article markup', () => {
    const content = sanitizeBlogContent(
      '<h2>Safe</h2><script>alert(1)</script><a href="javascript:alert(1)">link</a>',
    );

    expect(content).toContain('<h2>Safe</h2>');
    expect(content).not.toContain('script');
    expect(content).not.toContain('javascript:');
  });
});
