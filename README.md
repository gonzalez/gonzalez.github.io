# gonzalez.github.io

Personal site. Next.js, statically exported, deployed to GitHub Pages by
GitHub Actions.

## Editing content

Everything you'd normally want to change lives in one file:
[`src/content/site.ts`](src/content/site.ts).

- `name` — the GitHub handle shown in the header, page title, and footer
- `socials` — the links under the name
- `featured` — repos pinned to the top of the list, in that order
- `hidden` — repos excluded from the list entirely
- `includeForks` — `false` by default, so only your own work is listed

The site intentionally has no name, role, or bio fields — it identifies the
account by its GitHub handle only.

## How the repo list works

The list is built from the GitHub REST API **at build time**, not in the
browser. Two consequences worth knowing:

1. Visitors never hit the GitHub API, so the unauthenticated 60 req/hour
   rate limit is never a factor.
2. The data is only as fresh as the last build. The deploy workflow runs on
   a weekly cron for exactly this reason, in addition to running on push.

If the API call fails during a build, it falls back to
`src/content/repos-snapshot.json` so a deploy never ships an empty list.

To refresh that snapshot:

```sh
gh api --paginate 'users/gonzalez/repos?per_page=100&sort=pushed&type=owner' \
  --jq '[.[] | {name, description, url: .html_url, language, stars: .stargazers_count, pushedAt: .pushed_at, isFork: .fork, isArchived: .archived, topics: (.topics // [])}]' \
  | jq -s 'add' > src/content/repos-snapshot.json
```

## Local development

```sh
npm install
npm run dev          # dev server at http://localhost:3000
npm run build        # static export into out/
npm run serve        # serve the built output
npm run typecheck
```

To verify the snapshot fallback path, point the API at a dead host:

```sh
GITHUB_API_ROOT=https://invalid.invalid npm run build
```

## Deployment

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds the
export and publishes `out/` to Pages. The Pages source must be set to
**GitHub Actions** (not "deploy from a branch").

## Design notes

Strictly monochrome — there is no accent hue anywhere in the stylesheet.
Hierarchy comes from contrast, weight, size and whitespace. Dark mode follows
`prefers-color-scheme` rather than a toggle, and the repo list is rendered as
hairline-separated rows rather than cards to keep the page flat.
