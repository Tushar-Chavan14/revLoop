import { redirect } from "next/navigation";

// Ride chat now lives in a floating widget on the ride detail page itself —
// this route only exists so older links/bookmarks (and the "Recent messages"
// list on the dashboard) still land somewhere useful, auto-opening the widget.
type RideChatPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RideChatPage({ params }: RideChatPageProps) {
  const { id } = await params;
  redirect(`/rides/${id}?chat=open`);
}
