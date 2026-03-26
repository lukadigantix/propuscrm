import Image from "next/image";
import { login } from "./actions";
import LoginForm from "./LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/40 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/logo-dark.png" alt="Propus CRM" width={160} height={60} className="object-contain h-14 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Propus CRM</h1>
          <p className="text-sm text-zinc-500 mt-1">Sign in to your account</p>
        </div>

        <LoginForm action={login} />

        <p className="text-center text-xs text-zinc-400 mt-6">
          Propus AG &mdash; Zürich
        </p>
      </div>
    </div>
  );
}
