"use client";

import { useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { uploadBillScan } from "@/actions/bills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ScanUploadForm() {
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function setFile(file: File | undefined) {
    if (file) setFileName(file.name);
    else setFileName("");
  }

  return (
    <Card className="border-brand/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-brand" />
          Naskenovať doklad
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={uploadBillScan} className="space-y-4">
          <div
            className={cn(
              "rounded-xl border border-dashed p-8 text-center transition-colors",
              dragOver
                ? "border-brand bg-brand-muted/20"
                : "border-border-strong bg-surface/40"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file && fileRef.current) {
                const dt = new DataTransfer();
                dt.items.add(file);
                fileRef.current.files = dt.files;
                setFile(file);
              }
            }}
          >
            <Upload className="mx-auto h-10 w-10 text-brand" />
            <p className="mt-3 text-base font-medium text-zinc-100">
              Fotka, sken alebo PDF
            </p>
            <p className="mt-1 text-sm text-muted">
              Automaticky sa premení na PDF na stiahnutie
            </p>
            <input
              ref={fileRef}
              type="file"
              name="file"
              accept="application/pdf,image/jpeg,image/png,image/jpg"
              capture="environment"
              required
              className="mt-4 block w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:font-medium file:text-black"
              onChange={(e) => setFile(e.target.files?.[0])}
            />
            {fileName && (
              <p className="mt-3 text-sm text-brand">✓ {fileName}</p>
            )}
          </div>

          <FormField label="Názov (voliteľné)" htmlFor="name">
            <Input
              id="name"
              name="name"
              placeholder="napr. O2 faktúra marec"
            />
          </FormField>

          <Button type="submit" className="w-full" size="lg" variant="primary">
            Vytvoriť PDF
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
