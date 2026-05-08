import { login, signup } from '../auth/login'

type LoginPageProps = {
  searchParams?: {
    error?: string
    message?: string
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main>
      <section>
        <h1>Log in</h1>
        <p>Use your email and password to access FieldDriven.</p>

        {searchParams?.error ? (
          <p className="alert">{searchParams.error}</p>
        ) : null}
        {searchParams?.message ? (
          <p className="notice">{searchParams.message}</p>
        ) : null}

        <form className="auth-form">
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={6}
              required
            />
          </label>
          <div className="button-row">
            <button formAction={login}>Log in</button>
            <button formAction={signup} type="submit" className="secondary">
              Sign up
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}
