import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4 dot-grid">
      <div className="animate-in">
        <div className="text-8xl mb-6">🗓️</div>
        <h1 className="font-display font-bold text-4xl text-white mb-3">Page Not Found</h1>
        <p className="text-navy-300 mb-8 max-w-sm mx-auto">
          This page doesn't exist or has been moved.
        </p>
        <Link href="/" className="btn-primary">← Back to SchedulrX</Link>
      </div>
    </div>
  );
}
