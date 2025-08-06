export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Marketing Site Test</h1>
        <p className="text-lg text-gray-600">
          If you can see this, the marketing app is working!
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Environment: {process.env.NODE_ENV}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Dashboard URL: {process.env.NEXT_PUBLIC_DASHBOARD_URL || 'Not set'}
        </div>
      </div>
    </div>
  )
}