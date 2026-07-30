import { redirect } from "next/navigation";
import { BASE_PATH, getSessionUser } from "@/lib/auth";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) redirect(`${BASE_PATH}/login`);

  return (
    <main className="mx-auto max-w-md p-4 sm:p-8">
      <h1 className="page-title">Account</h1>
      <p className="mt-1 text-sm text-gray-500">
        Change the password for {user.email}.
      </p>
      <div className="mt-6">
        <ChangePasswordForm />
      </div>
    </main>
  );
}
