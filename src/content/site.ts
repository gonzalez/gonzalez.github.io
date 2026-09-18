/**
 * Single source of truth for all editable site copy.
 *
 * This is the only file you need to touch to change what the site says.
 * Deliberately free of any personal name or job/role description — the
 * page identifies the account by its GitHub handle only.
 */

export interface SocialLink {
  label: string
  href: string
}

export const site = {
  /** GitHub account whose public repositories are listed. */
  githubUsername: 'gonzalez',

  /** Canonical origin, used for metadata and the sitemap. */
  url: 'https://gonzalez.github.io',

  /** Displayed in the header, page title, and footer. The GitHub handle. */
  name: 'gonzalez',

  /** Rendered in the header and footer. TODO: fill in or remove entries. */
  socials: [
    { label: 'GitHub', href: 'https://github.com/gonzalez' },
    // { label: 'Email', href: 'mailto:you@example.com' },
    // { label: 'LinkedIn', href: 'https://www.linkedin.com/in/your-handle' },
  ] satisfies SocialLink[],

  /**
   * Repos pinned to the top of the list, in this exact order.
   * Anything not listed here is sorted by stars, then most recently pushed.
   */
  featured: [
    'grafana-pulumi',
    'wwwsofrito',
    'doodles',
    'postfix_bounce_parser',
    'selfsignedcerts',
    'rubyflip',
  ],

  /** Repos excluded from the listing entirely. */
  hidden: [
    // This site's own repo — listing it here would be circular.
    'gonzalez.github.io',
    // Auto-generated GitHub name, no description, no content worth showing.
    'super-duper-octo-engine',
    // A vendored source tarball rather than authored work.
    'apache-httpd-2.4.9',
  ],

  /**
   * Forks are upstream projects, not authored work, so they are hidden by
   * default. Flip to `true` to include them in the listing.
   */
  includeForks: false,
} as const
