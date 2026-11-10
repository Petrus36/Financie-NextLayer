"use client";

import { useEffect, useMemo, useState } from "react";
import { FormField } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function TeamPaymentQr({
  name,
  iban,
  bic,
}: {
  name: string;
  iban: string;
  bic?: string | null;
}) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const parsedAmount = useMemo(() => {
    const value = parseFloat(amount.replace(",", "."));
    return !amount.trim() || isNaN(value) || value <= 0 ? null : value;
  }, [amount]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/team/payment-qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            iban,
            bic,
            amount: parsedAmount,
            note: note.trim() || null,
          }),
          signal: controller.signal,
        });
        const data = (await res.json()) as { dataUrl?: string; error?: string };
        if (!res.ok || !data.dataUrl) {
          setQrDataUrl(null);
          setError(data.error ?? "QR sa nepodarilo vytvoriť");
          return;
        }
        setQrDataUrl(data.dataUrl);
        setError(null);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setQrDataUrl(null);
        setError("QR sa nepodarilo vytvoriť");
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [iban, bic, name, parsedAmount, note]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField label="Suma (voliteľné)" htmlFor="qr-amount">
          <Input
            id="qr-amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Nechajte prázdne → zadáte v banke"
          />
        </FormField>
        <FormField label="Poznámka k platbe" htmlFor="qr-note">
          <Input
            id="qr-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Projekt, mesiac…"
          />
        </FormField>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/15 bg-white p-5">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt={`QR platba pre ${name}`} className="h-56 w-56" />
        ) : (
          <div className="flex h-56 w-56 items-center justify-center text-sm text-zinc-500">
            {loading ? "Pripravujem QR…" : error ?? "QR nie je dostupné"}
          </div>
        )}
        <p className="text-center text-xs text-zinc-600">
          Pay by Square — naskenujte v bankovej appke
          {parsedAmount == null
            ? " a zadajte sumu."
            : ` · predvyplnené ${parsedAmount.toFixed(2)} €.`}
        </p>
      </div>
    </div>
  );
}
