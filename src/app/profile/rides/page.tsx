import Link from "next/link";
import { redirect } from "next/navigation";
import { Ban, CalendarCheck, Compass, ArrowLeft, Radio } from "lucide-react";
import { EmptyState } from "@/components/design-system/state-panel";
import { Timeline } from "@/components/design-system/timeline";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/site-header";
import { rideToTimelineItem } from "@/features/rides/ride-timeline-item";
import { getAuthUser } from "@/services/profiles";
import { getMyRidesGrouped, type MyRides } from "@/services/rides";

export const metadata = {
  title: "My rides",
};

function ridesGroupCount(group: MyRides) {
  return group.upcoming.length + group.ongoing.length + group.completed.length + group.cancelled.length;
}

function RidesGroupSections({ group }: { group: MyRides }) {
  const { upcoming, ongoing, completed, cancelled } = group;

  if (ridesGroupCount(group) === 0) {
    return <p className="text-muted-foreground py-6 text-sm">Nothing here yet.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {ongoing.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading flex items-center gap-2 text-lg font-bold tracking-tight">
            <Radio className="text-primary size-4" />
            Ongoing
          </h2>
          <Timeline items={ongoing.map((ride) => rideToTimelineItem(ride, true, "live"))} />
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading flex items-center gap-2 text-lg font-bold tracking-tight">
            <Compass className="text-primary size-4" />
            Upcoming
          </h2>
          <Timeline items={upcoming.map((ride) => rideToTimelineItem(ride, true, "open"))} />
        </section>
      )}

      {completed.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading flex items-center gap-2 text-lg font-bold tracking-tight">
            <CalendarCheck className="text-primary size-4" />
            Completed — ride memories
          </h2>
          <Timeline items={completed.map((ride) => rideToTimelineItem(ride, false, "completed"))} />
        </section>
      )}

      {cancelled.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading flex items-center gap-2 text-lg font-bold tracking-tight">
            <Ban className="text-primary size-4" />
            Cancelled
          </h2>
          <Timeline items={cancelled.map((ride) => rideToTimelineItem(ride, false, "cancelled"))} />
        </section>
      )}
    </div>
  );
}

export default async function MyRidesPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const { community, hosted, booked } = await getMyRidesGrouped(user.id);
  const hasAnyRides = ridesGroupCount(community) + ridesGroupCount(hosted) + ridesGroupCount(booked) > 0;

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
        <div className="flex flex-col gap-2">
          <Link
            href="/profile"
            className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-sm"
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </Link>
          <h1 className="font-heading text-2xl font-bold tracking-tight">My rides</h1>
          <p className="text-muted-foreground">Every ride you&apos;ve organized, joined, or booked.</p>
        </div>

        {!hasAnyRides ? (
          <EmptyState
            title="No rides planned yet"
            description="Start your next adventure — create a ride or find one to join."
            action={
              <div className="flex gap-2">
                <Button
                  nativeButton={false}
                  render={<Link href="/rides/create">Create a ride</Link>}
                />
                <Button
                  nativeButton={false}
                  variant="outline"
                  render={<Link href="/rides">Discover rides</Link>}
                />
              </div>
            }
          />
        ) : (
          <Tabs defaultValue="community">
            <TabsList>
              <TabsTrigger value="community">Community rides</TabsTrigger>
              <TabsTrigger value="hosted">Hosted rides</TabsTrigger>
              <TabsTrigger value="booked">Booked rides</TabsTrigger>
            </TabsList>
            <TabsContent value="community">
              <RidesGroupSections group={community} />
            </TabsContent>
            <TabsContent value="hosted">
              <RidesGroupSections group={hosted} />
            </TabsContent>
            <TabsContent value="booked">
              <RidesGroupSections group={booked} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
