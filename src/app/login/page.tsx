import { loginAction } from "./actions";
import { safeRedirectPath } from "@/lib/auth/redirect";
import styles from "./page.module.css";

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const safeNext = safeRedirectPath(params.next);
  const hasError = params.error === "1";

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Sign in</h1>
        <p className={styles.lede}>
          A private family guide — enter the password.
        </p>

        {hasError ? (
          <p className={styles.error} role="status" aria-live="polite">
            Incorrect password. Please try again.
          </p>
        ) : null}

        <form action={loginAction} className={styles.form}>
          <label className={styles.field} htmlFor="password">
            <span className={styles.label}>Password</span>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={styles.input}
            />
          </label>

          <input type="hidden" name="next" value={safeNext} />

          <button type="submit" className={styles.submit}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
