"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result?.ok) {
      setError(
        result?.error === "CredentialsSignin"
          ? "Nesprávny email alebo heslo"
          : "Prihlásenie zlyhalo. Skúste znova alebo kontaktujte administrátora."
      );
      setLoading(false);
      return;
    }

    // Full page load ensures the session cookie is sent to middleware
    window.location.href = "/dashboard";
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Email" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@nextlayer.studio"
              autoComplete="email"
            />
          </FormField>
          <FormField label="Heslo" htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </FormField>
          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Prihlasujem..." : "Prihlásiť sa"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
