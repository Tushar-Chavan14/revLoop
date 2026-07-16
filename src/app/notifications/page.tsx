import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { NotificationsInbox } from "@/features/notifications/components/notifications-inbox";
import { getAuthUser } from "@/services/profiles";
import { getAllNotifications } from "@/services/notifications";

export const metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  const notifications = await getAllNotifications(user.id);

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
        <h1 className="font-heading text-2xl font-bold tracking-tight">Notifications</h1>
        <NotificationsInbox initialNotifications={notifications} />
      </div>
    </div>
  );
}
