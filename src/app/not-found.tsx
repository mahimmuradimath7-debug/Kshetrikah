import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-narrow py-24 text-center">
      <span className="text-7xl block mb-4">🌱</span>
      <h1 className="font-display text-3xl font-bold text-leaf-900 mb-2">
        Page not found
      </h1>
      <p className="text-leaf-700 mb-6">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <Link href="/en" className="btn-primary">
        Back to home
      </Link>
    </div>
  );
}
