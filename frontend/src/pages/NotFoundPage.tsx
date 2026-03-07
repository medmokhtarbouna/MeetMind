import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '../components/Button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-body)] px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[var(--color-text)] mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-2">
            Page not found
          </h2>
          <p className="text-base text-[var(--color-text-muted)]">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center whitespace-nowrap border font-medium transition-colors rounded-[999px] text-base px-6 py-3 gap-2 bg-[#26b1b3] hover:bg-[#26b1b3]/90 text-white border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
          <Button
            variant="secondary"
            size="md"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => window.history.back()}
            className="px-6 py-3"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
