import Link from 'next/link';

export default function Index() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-20 text-slate-900">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">VisibleFix</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Report city issues in under 60 seconds</h1>
      <p className="mt-5 max-w-2xl text-lg text-slate-600">
        Share potholes, broken lights, waste problems, and more with location details so municipal teams can act quickly.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/report"
          className="rounded-md bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Start a report
        </Link>
        <Link
          href="/issues"
          className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Browse issues
        </Link>
        <Link
          href="/admin"
          className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Admin console
        </Link>
      </div>
    </main>
  );
}
