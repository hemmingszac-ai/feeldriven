export default function HomePage() {
  return (
    <main>
      <section>
        <h1>FieldDriven</h1>
        <p>A workplace platform that makes work feel like being part of a high-performing team. Leaders turn tasks into shared missions, while live progress, recognition, and rewards make employees genuinely want to contribute and win together.</p>

        <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
          <h2>Starter app features</h2>
          <ul>
            <li>Next.js App Router scaffold</li>
            <li>TypeScript support</li>
            <li>Responsive minimal UI</li>
            <li>Ready for Supabase, auth, and custom AI workflows</li>
          </ul>
        </div>

        <footer>
          <p>Next step: add your SaaS workflow, authentication, storage, or AI API integration.</p>
        </footer>
      </section>
    </main>
  );
}
