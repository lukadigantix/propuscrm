import { Camera } from "lucide-react";
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
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-200">
            <Camera className="w-5 h-5 text-white" />
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
