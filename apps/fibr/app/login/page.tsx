import Link from "next/link";
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
    <main className="mx-auto max-w-md p-4 sm:p-8">
      <h1 className="page-title">Log in</h1>
      <p className="mt-1 text-sm text-gray-500">
        Sign in to your fibr account.
      </p>
      <div className="mt-6">
        <LoginForm next={safeNext} />
      </div>
      <p className="mt-4 text-sm text-gray-500">
        No account?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
