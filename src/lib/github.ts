import { site } from '@/content/site'
import snapshot from '@/content/repos-snapshot.json'

/**
 * Repository data layer.
 *
 * This module runs at BUILD TIME only. The site is statically exported, so
 * there is no server at runtime and no client-side GitHub call — which also
 * means visitors never consume the unauthenticated 60 req/hour rate limit.
 *
 * Freshness comes from rebuilding: the deploy workflow runs on a weekly cron
 * in addition to on push.
 */

/** The subset of the GitHub REST repo payload this site actually uses. */
export interface Repo {
  name: string
  description: string | null
  url: string
  language: string | null
  stars: number
  pushedAt: string
  isFork: boolean
  isArchived: boolean
  topics: string[]
}

/** Shape of the raw GitHub REST API response, narrowed to what we read. */
interface GitHubApiRepo {
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  pushed_at: string
  fork: boolean
  archived: boolean
  topics?: string[]
}

/**
 * Overridable so the snapshot fallback can be exercised in a real build:
 * `GITHUB_API_ROOT=https://invalid.invalid npm run build`
 */
const API_ROOT = process.env.GITHUB_API_ROOT ?? 'https://api.github.com'
const PER_PAGE = 100
const MAX_PAGES = 5

function toRepo(raw: GitHubApiRepo): Repo {
  return {
    name: raw.name,
    description: raw.description,
    url: raw.html_url,
    language: raw.language,
    stars: raw.stargazers_count,
    pushedAt: raw.pushed_at,
    isFork: raw.fork,
    isArchived: raw.archived,
    topics: raw.topics ?? [],
  }
}

/**
 * Pull every public repo for the configured user.
 *
 * `GITHUB_TOKEN` is optional. It is not required for public data, but CI
 * provides one automatically and it raises the rate limit from 60 to 5000
 * requests per hour, which matters when builds run frequently.
 */
async function fetchFromApi(): Promise<Repo[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  const collected: Repo[] = []

  for (let page = 1; page <= MAX_PAGES; page++) {
    const endpoint = `${API_ROOT}/users/${site.githubUsername}/repos?per_page=${PER_PAGE}&page=${page}&sort=pushed&type=owner`

    const response = await fetch(endpoint, { headers })

    if (!response.ok) {
      throw new Error(
        `GitHub API responded ${response.status} ${response.statusText} for page ${page}`,
      )
    }

    const batch = (await response.json()) as GitHubApiRepo[]
    collected.push(...batch.map(toRepo))

    // A short page means we have reached the end of the list.
    if (batch.length < PER_PAGE) break
  }

  return collected
}

/** Drop forks and anything explicitly suppressed in the content config. */
function applyVisibilityRules(repos: Repo[]): Repo[] {
  const hidden = new Set<string>(site.hidden)

  return repos.filter((repo) => {
    if (hidden.has(repo.name)) return false
    if (repo.isFork && !site.includeForks) return false
    return true
  })
}

/**
 * Featured repos come first in their configured order. Everything else is
 * ranked by stars, then by how recently it was pushed.
 */
function applyOrdering(repos: Repo[]): Repo[] {
  const featuredRank = new Map<string, number>(
    site.featured.map((name, index) => [name, index]),
  )

  return [...repos].sort((a, b) => {
    const rankA = featuredRank.get(a.name)
    const rankB = featuredRank.get(b.name)

    if (rankA !== undefined && rankB !== undefined) return rankA - rankB
    if (rankA !== undefined) return -1
    if (rankB !== undefined) return 1

    if (a.stars !== b.stars) return b.stars - a.stars

    return Date.parse(b.pushedAt) - Date.parse(a.pushedAt)
  })
}

/**
 * Resolve the repo list for the build.
 *
 * If the API call fails — rate limit, outage, no network — fall back to the
 * committed snapshot rather than shipping a site with an empty project list.
 */
export async function getRepos(): Promise<Repo[]> {
  let repos: Repo[]

  try {
    repos = await fetchFromApi()
    console.info(`[github] fetched ${repos.length} repos from the API`)
  } catch (error) {
    console.warn(
      `[github] API fetch failed, falling back to committed snapshot: ${
        error instanceof Error ? error.message : String(error)
      }`,
    )
    repos = snapshot as Repo[]
  }

  return applyOrdering(applyVisibilityRules(repos))
}

/** Coarse relative time, e.g. "3 months ago". Precision is not the point. */
export function relativeTime(iso: string): string {
  const then = Date.parse(iso)
  if (Number.isNaN(then)) return ''

  const seconds = Math.floor((Date.now() - then) / 1000)

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ]

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  for (const [unit, secondsPerUnit] of units) {
    const value = Math.floor(seconds / secondsPerUnit)
    if (value >= 1) return formatter.format(-value, unit)
  }

  return 'just now'
}

/** Absolute date for the `datetime`/`title` attributes on the relative label. */
export function absoluteDate(iso: string): string {
  const parsed = new Date(iso)
  if (Number.isNaN(parsed.getTime())) return ''

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
