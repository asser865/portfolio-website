import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <p className="text-label mb-6">404</p>
      <h1 className="text-display text-[clamp(2.6rem,8vw,6rem)] text-white">
        Nothing here survived testing.
      </h1>
      <Link
        href="/"
        className="glass text-label mt-12 rounded-full px-7 py-4 !text-white transition-colors hover:bg-white hover:!text-black"
      >
        Back home
      </Link>
    </main>
  );
}
