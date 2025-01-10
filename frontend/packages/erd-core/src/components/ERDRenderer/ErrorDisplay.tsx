import type { ProcessError } from '@liam-hq/db-structure'
import { InfoIcon } from '@liam-hq/ui'
import type { FC } from 'react'
import styles from './ErrorDisplay.module.css'

type Props = {
  errors: ProcessError[]
}

export const ErrorDisplay: FC<Props> = ({ errors }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>
        <div className={styles.iconWrapper}>
          <InfoIcon color="var(--callout-warning-text)" />
        </div>
        <div className={styles.inner}>
          <div className={styles.message1}>
            <div className={styles.message1Title}>
              Oh no! We’ve encountered {errors.length} errors 🛸💫
            </div>
            <div className={styles.message1Sentence}>
              <p>
                It seems {errors.length} SQL statements couldn’t make it through
                the parser’s orbit.
              </p>
              <p>
                Parsing every SQL dialect is like navigating an asteroid
                field—it’s tricky, but we’re working on it!
              </p>
            </div>
          </div>

          <div className={styles.message2}>
            <div className={styles.message2Title}>
              🚀 Here’s what you can do next
            </div>
            <div className={styles.message2Sentence}>
              <p>Adjust your SQL: A small update might clear things up.</p>
              <p>
                Move ahead with your project: You can still create it! The
                unrecognized statements will just be skipped.
              </p>
            </div>
            <a
              href="https://liambx.com/docs"
              target="_blank"
              className={styles.callout}
              rel="noreferrer"
            >
              Check out the troubleshooting guide →
            </a>
          </div>

          <div className={styles.message3}>
            <div className={styles.message3Title}>🌟 Send a signal!</div>
            <div className={styles.message3Sentence}>
              <p>
                Your report will help me and the team refine our SQL engines to
                handle even the most out-of-this-world syntax.
              </p>
              <p>Thanks for helping us explore the SQL galaxy together! </p>
            </div>
            <a
              href="https://github.com/liam-hq/liam/discussions"
              target="_blank"
              className={styles.callout}
              rel="noreferrer"
            >
              Send Signal →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
