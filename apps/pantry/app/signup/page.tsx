import Link from "next/link";
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-md p-4 sm:p-8">
      <h1 className="page-title">Sign up</h1>
      <p className="mt-1 text-sm text-[#7a6a5d]">
        Create your pantry account.
      </p>
      <div className="mt-6">
        <SignupForm />
      </div>
      <p className="mt-4 text-sm text-[#7a6a5d]">
        Already have an account?{" "}
        <Link href="/login" className="text-terracotta hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
