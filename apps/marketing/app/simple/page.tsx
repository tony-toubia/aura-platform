export default function SimplePage() {
  const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || "https://app.aura-link.app";

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Aura Link - Marketing Site</h1>
      <p>This is a simple test page to verify the marketing site is working.</p>
      <p>Dashboard URL: {dashboardUrl}</p>
      <a href={`${dashboardUrl}/register`} style={{ color: 'blue', textDecoration: 'underline' }}>
        Get Started
      </a>
    </div>
  )
}