import Link from "next/link";
import SignupForm from "@/components/SignupForm";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-md p-4 sm:p-8">
      <h1 className="page-title">Sign up</h1>
      <p className="mt-1 text-sm text-gray-500">
        Create your fibr account.
      </p>
      <div className="mt-6">
        <SignupForm />
      </div>
      <p className="mt-4 text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
