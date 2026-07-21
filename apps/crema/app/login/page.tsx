import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  // Only allow same-site relative paths (no protocol-relative open redirects).
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="page-title">crema is private</h1>
      <p className="mt-1 text-sm text-[#7a6a5d]">
        Enter the password to continue.
      </p>
      <div className="mt-6">
        <LoginForm next={safeNext} />
      </div>
    </main>
  );
}
