import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createTeamMember } from "@/actions/team";
import { TeamMemberForm } from "@/components/team/team-member-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewTeamMemberPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/team"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Späť na tím
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Nový člen tímu</h1>
        <p className="text-sm text-muted">Kontakt a bankové údaje pre QR platby</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Údaje</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamMemberForm action={createTeamMember} submitLabel="Vytvoriť člena" />
        </CardContent>
      </Card>
    </div>
  );
}
