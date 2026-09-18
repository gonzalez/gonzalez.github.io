import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { RepoList } from '@/components/RepoList'
import { getRepos } from '@/lib/github'
import styles from './page.module.css'

/**
 * `getRepos()` runs during `next build`, not in the browser. The output is
 * baked into the exported HTML.
 */
export default async function HomePage() {
  const repos = await getRepos()
  const builtAt = new Date().toISOString()

  return (
    <div className={styles.shell}>
      <Header />

      <main>
        <section className={styles.section} aria-labelledby="repos">
          <div className={styles.sectionHeader}>
            <h2 className={styles.heading} id="repos">
              Repositories
            </h2>
            <p className={styles.count}>
              {repos.length} {repos.length === 1 ? 'repository' : 'repositories'}
            </p>
          </div>
          <RepoList repos={repos} />
        </section>
      </main>

      <Footer builtAt={builtAt} />
    </div>
  )
}
