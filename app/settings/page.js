import { redirect } from "next/navigation";
import { requireUser } from "@/lib/requireUser";
import Navbar from "@/components/Navbar";
import SettingsForm from "@/components/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <Navbar user={{ name: user.name, collegeName: user.collegeName }} />
      <main className="mx-auto max-w-2xl px-6 py-8 sm:py-10">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">Home settings</p>
        <h1 className="mb-6 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Semester &amp; periods
        </h1>
        <SettingsForm initialSettings={JSON.parse(JSON.stringify(user.settings))} />
      </main>
    </div>
  );
}
