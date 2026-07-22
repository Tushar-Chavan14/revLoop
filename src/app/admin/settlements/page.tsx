import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { EmptyState } from "@/components/design-system/state-panel";
import { SettlementGroupCard } from "@/features/admin/components/settlement-group-card";
import { getAuthUser } from "@/services/profiles";
import { isCurrentUserAdmin } from "@/services/roles";
import { getSettlementGroups } from "@/services/settlements";

export const metadata = {
  title: "Settlements",
};

export default async function AdminSettlementsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }
  if (!(await isCurrentUserAdmin())) {
    notFound();
  }

  const groups = await getSettlementGroups();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-bold tracking-tight">Organizer Settlements</h1>
          <p className="text-muted-foreground">
            Paid Organized Ride bookings awaiting manual payout to the organizer.
          </p>
        </div>

        {groups.length === 0 ? (
          <EmptyState
            title="Nothing To Settle"
            description="Every paid Organized Ride booking has been settled."
          />
        ) : (
          <div className="flex flex-col gap-6">
            {groups.map((group) => (
              <SettlementGroupCard key={group.organizerId} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
