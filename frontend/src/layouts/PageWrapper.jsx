// layouts/PageWrapper.jsx
// Wraps page content with consistent padding and max-width.
// All app pages should be wrapped in this component.

import { cn } from '@/lib/utils'


export default function PageWrapper({ children, className, fullWidth = false }) {
  return (
    <div
      className={cn(
        'p-6',
        !fullWidth && 'max-w-screen-2xl mx-auto w-full',
        className,
      )}
    >
      {children}
    </div>
  )
}
