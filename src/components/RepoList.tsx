import { absoluteDate, relativeTime, type Repo } from '@/lib/github'
import styles from './RepoList.module.css'

interface RepoListProps {
  repos: Repo[]
}

export function RepoList({ repos }: RepoListProps) {
  if (repos.length === 0) {
    return <p className={styles.empty}>No repositories to show.</p>
  }

  return (
    <ul className={styles.list}>
      {repos.map((repo) => (
        <li key={repo.name} className={styles.item}>
          <article className={styles.row}>
            <h3 className={styles.name}>
              {/* The link is stretched across the row via ::after so the whole
                  row is a click target, while the accessible name stays just
                  the repo name. */}
              <a
                className={styles.link}
                href={repo.url}
                rel="noopener noreferrer"
              >
                {repo.name}
              </a>
            </h3>

            {repo.description && (
              <p className={styles.description}>{repo.description}</p>
            )}

            <p className={styles.meta}>
              {repo.language && (
                <span className={styles.metaItem}>{repo.language}</span>
              )}

              {repo.stars > 0 && (
                <span className={styles.metaItem}>
                  {repo.stars}
                  <span className="visually-hidden">
                    {repo.stars === 1 ? ' star' : ' stars'}
                  </span>
                  <span aria-hidden="true"> ★</span>
                </span>
              )}

              {repo.isArchived && (
                <span className={styles.metaItem}>archived</span>
              )}

              {repo.isFork && <span className={styles.metaItem}>fork</span>}

              <time
                className={styles.metaItem}
                dateTime={repo.pushedAt}
                title={absoluteDate(repo.pushedAt)}
              >
                {relativeTime(repo.pushedAt)}
              </time>
            </p>
          </article>
        </li>
      ))}
    </ul>
  )
}
