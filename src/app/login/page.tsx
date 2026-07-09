import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { Layers } from "lucide-react";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand/10 via-black to-black" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand shadow-lg shadow-brand/25">
            <Layers className="h-7 w-7 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">NextLayer Studio</h1>
          <p className="mt-1 text-sm text-muted">Prihláste sa do finančného systému</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
