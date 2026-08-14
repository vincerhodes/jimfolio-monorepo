import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Only allow same-site relative paths (no protocol-relative open redirects).
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-950 p-8">
        <h1 className="text-xl font-semibold text-neutral-100">
          Kickoff Logo Lab
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Enter the password to continue.
        </p>
        <div className="mt-6">
          <LoginForm next={safeNext} />
        </div>
      </div>
    </main>
  );
}
