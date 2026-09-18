import { site } from '@/content/site'
import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.name}>{site.name}</h1>

      {site.socials.length > 0 && (
        <nav aria-label="Elsewhere">
          <ul className={styles.socials}>
            {site.socials.map((social) => (
              <li key={social.href}>
                <a
                  className={styles.social}
                  href={social.href}
                  rel="me noopener noreferrer"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
