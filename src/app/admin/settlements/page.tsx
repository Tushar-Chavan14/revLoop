import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { EmptyState } from "@/components/design-system/state-panel";
import { PageHeading } from "@/components/design-system/page-heading";
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
        <PageHeading
          title="Ride Captain settlements"
          description="Paid organized ride bookings awaiting manual payout to the Ride Captain."
        />

        {groups.length === 0 ? (
          <EmptyState
            title="Nothing to settle"
            description="Every paid organized ride booking has been settled."
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
