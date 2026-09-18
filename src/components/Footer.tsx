import { site } from '@/content/site'
import styles from './Footer.module.css'

interface FooterProps {
  /** Build timestamp, so the page can state how current the repo data is. */
  builtAt: string
}

export function Footer({ builtAt }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <p className={styles.line}>
        <span>
          © {new Date(builtAt).getFullYear()} {site.name}
        </span>
        <span className={styles.separator} aria-hidden="true">
          ·
        </span>
        <span>
          Repository data refreshed{' '}
          <time dateTime={builtAt}>
            {new Date(builtAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </time>
        </span>
      </p>
    </footer>
  )
}
