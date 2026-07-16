"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bike,
  Calendar,
  Check,
  Compass,
  Home,
  MapPin,
  MountainSnow,
  UserRound,
  Users,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { StatusChip } from "@/components/ui/status-chip";

import { ChatBubble } from "@/components/design-system/chat-bubble";
import { DestinationCard } from "@/components/design-system/destination-card";
import { ImageGallery } from "@/components/design-system/image-gallery";
import { MapContainer } from "@/components/design-system/map-container";
import { NotificationCard } from "@/components/design-system/notification-card";
import { ProfileCard } from "@/components/design-system/profile-card";
import { EmptyState, ErrorState, SuccessState } from "@/components/design-system/state-panel";
import { ListRowSkeleton, RideCardSkeleton } from "@/components/design-system/skeletons";
import { StatCard } from "@/components/design-system/stat-card";
import { Reveal } from "@/components/reveal";
import { toast } from "@/lib/toast";

const PHOTO = (seed: string, w = 800, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const COLOR_SWATCHES = [
  { name: "Primary", className: "bg-primary", token: "--primary" },
  { name: "Primary Hover", className: "bg-primary-hover", token: "--primary-hover" },
  { name: "Primary Soft", className: "bg-primary-soft", token: "--primary-soft" },
  { name: "Background", className: "bg-background ring-border ring-1", token: "--background" },
  { name: "Surface", className: "bg-card ring-border ring-1", token: "--card" },
  { name: "Border", className: "bg-border", token: "--border" },
  { name: "Text", className: "bg-foreground", token: "--foreground" },
  { name: "Secondary text", className: "bg-muted-foreground", token: "--muted-foreground" },
  { name: "Secondary surface", className: "bg-secondary", token: "--secondary" },
  { name: "Success", className: "bg-success", token: "--success" },
  { name: "Warning", className: "bg-warning", token: "--warning" },
  { name: "Danger", className: "bg-destructive", token: "--destructive" },
];

export default function DesignSystemPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 py-16 pb-32">
      <header className="flex flex-col gap-3">
        <Badge variant="outline" className="w-fit">
          Internal · not linked from product nav
        </Badge>
        <h1 className="font-display text-6xl uppercase sm:text-8xl">RevLoop Design System</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Adventure, freedom, brotherhood. Every token and component below is what future RevLoop
          screens are built from — photos before illustrations, real rides before product
          descriptions.
        </p>
      </header>

      <Section title="Color" description="Warm, high-contrast, never enterprise-gray.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {COLOR_SWATCHES.map((swatch) => (
            <div key={swatch.name} className="flex flex-col gap-2">
              <div className={`h-20 rounded-2xl ${swatch.className}`} />
              <div>
                <p className="text-sm font-medium">{swatch.name}</p>
                <p className="text-muted-foreground font-mono text-xs">{swatch.token}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography" description="Hero: Bebas Neue. Everything else: Inter.">
        <div className="flex flex-col gap-6">
          <div>
            <p className="font-display text-7xl uppercase">Kickstands Up</p>
            <p className="text-muted-foreground mt-1 text-xs">
              font-display · Bebas Neue · hero statements only
            </p>
          </div>
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight">
              Weekend plans, sorted
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              font-heading · Inter Bold · section headings
            </p>
          </div>
          <div>
            <p className="text-base">
              Every riding crew knows the drill — someone says &ldquo;Sunday?&rdquo;, forty messages
              later nobody knows the plan.
            </p>
            <p className="text-muted-foreground mt-1 text-xs">font-sans · Inter · body copy</p>
          </div>
        </div>
      </Section>

      <Section title="Spacing, grid & radius" description="Breathing room over density.">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[2, 4, 6, 8, 12, 16, 20, 24].map((n) => (
            <div key={n} className="flex flex-col items-center gap-2">
              <div className="bg-muted flex h-16 w-full items-center justify-center rounded-lg">
                <div className="bg-primary h-4" style={{ width: `${n * 4}px` }} />
              </div>
              <p className="text-muted-foreground font-mono text-xs">space-{n}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-6">
          {[
            { name: "sm", className: "rounded-sm" },
            { name: "md", className: "rounded-md" },
            { name: "lg", className: "rounded-lg" },
            { name: "xl", className: "rounded-xl" },
            { name: "2xl", className: "rounded-2xl" },
            { name: "3xl", className: "rounded-3xl" },
          ].map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-2">
              <div className={`bg-primary/15 ring-primary/30 h-16 w-full ring-1 ${r.className}`} />
              <p className="text-muted-foreground font-mono text-xs">radius-{r.name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Elevation"
        description="Soft, warm-tinted shadows — never flat enterprise black."
      >
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-5">
          {[
            { name: "xs", className: "shadow-xs" },
            { name: "sm", className: "shadow-sm" },
            { name: "md", className: "shadow-md" },
            { name: "lg", className: "shadow-lg" },
            { name: "xl", className: "shadow-xl" },
          ].map((s) => (
            <div key={s.name} className="flex flex-col items-center gap-3 py-4">
              <div className={`bg-card size-16 rounded-2xl ${s.className}`} />
              <p className="text-muted-foreground font-mono text-xs">shadow-{s.name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Create a ride</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Cancel ride</Button>
          <Button variant="link">Link style</Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="lg">Large CTA</Button>
          <Button size="default">Default</Button>
          <Button size="sm">Small</Button>
          <Button size="icon" aria-label="Search">
            <Compass />
          </Button>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid max-w-md gap-3">
          <Input placeholder="Where are you riding?" />
          <Input placeholder="Disabled" disabled />
          <Input aria-invalid placeholder="Something's wrong" />
        </div>
      </Section>

      <Section title="Badges & status chips">
        <div className="flex flex-wrap gap-2">
          <Badge>Weekend Ride</Badge>
          <Badge variant="secondary">Touring</Badge>
          <Badge variant="outline">Adventure</Badge>
          <Badge variant="destructive">Cancelled</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusChip status="open" />
          <StatusChip status="filling" />
          <StatusChip status="full" />
          <StatusChip status="live" pulse />
          <StatusChip status="cancelled" />
          <StatusChip status="completed" />
        </div>
      </Section>

      <Section title="Avatars">
        <div className="flex flex-wrap items-center gap-6">
          <Avatar size="lg">
            <AvatarImage src={PHOTO("rider-1", 96, 96)} alt="Rider" />
            <AvatarFallback>R</AvatarFallback>
          </Avatar>
          <AvatarGroup>
            <Avatar>
              <AvatarImage src={PHOTO("rider-2", 96, 96)} alt="Rider" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src={PHOTO("rider-3", 96, 96)} alt="Rider" />
              <AvatarFallback>B</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src={PHOTO("rider-4", 96, 96)} alt="Rider" />
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+6</AvatarGroupCount>
          </AvatarGroup>
        </div>
      </Section>

      <Section title="Statistics cards">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={Users} label="Riders" value={4200} suffix="+" />
          <StatCard icon={Calendar} label="Rides planned" value={860} suffix="+" />
          <StatCard icon={MapPin} label="Cities" value={38} />
          <StatCard icon={MountainSnow} label="KM ridden" value={192000} suffix="+" />
        </div>
      </Section>

      <Section title="Destination cards">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <DestinationCard
            href="#"
            city="Coorg"
            rideCount={12}
            imageUrl={PHOTO("dest-coorg", 600, 800)}
          />
          <DestinationCard
            href="#"
            city="Leh"
            rideCount={4}
            imageUrl={PHOTO("dest-leh", 600, 800)}
          />
          <DestinationCard
            href="#"
            city="Munnar"
            rideCount={9}
            imageUrl={PHOTO("dest-munnar", 600, 800)}
          />
          <DestinationCard
            href="#"
            city="Chikmagalur"
            rideCount={7}
            imageUrl={PHOTO("dest-chik", 600, 800)}
          />
        </div>
      </Section>

      <Section title="Profile cards">
        <div className="grid gap-3 sm:grid-cols-2">
          <ProfileCard
            name="Rahul Verma"
            username="rahulrides"
            imageUrl={PHOTO("rider-5", 96, 96)}
            location="Bengaluru, IN"
            bike="Royal Enfield Himalayan"
            riderLevel="Experienced"
            action={
              <Button size="sm" variant="outline">
                View profile
              </Button>
            }
          />
          <ProfileCard
            name="Aisha Khan"
            username="aisha.k"
            imageUrl={PHOTO("rider-6", 96, 96)}
            location="Pune, IN"
            bike="KTM Duke 390"
            riderLevel="Intermediate"
            action={
              <Button size="sm">
                <Check className="size-3.5" /> Accept
              </Button>
            }
          />
        </div>
      </Section>

      <Section title="Notification cards">
        <div className="flex max-w-lg flex-col gap-2">
          <NotificationCard
            type="ride_join_request"
            message="Aisha Khan requested to join Sunrise loop to Nandi Hills"
            timeAgo="12m ago"
          />
          <NotificationCard
            type="ride_message"
            message="Rahul: Meeting point moved 200m up the road, same time"
            timeAgo="1h ago"
            read
          />
        </div>
      </Section>

      <Section title="Modal">
        <Dialog>
          <DialogTrigger render={<Button variant="outline">Open modal</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Leave this ride?</DialogTitle>
              <DialogDescription>
                Your seat opens up for another rider and the organizer is notified.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost">Stay in</Button>} />
              <DialogClose render={<Button variant="destructive">Leave ride</Button>} />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="Drawer" description="Mobile bottom sheet — swipe down to dismiss.">
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger render={<Button variant="outline">Open drawer</Button>} />
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filter rides</DrawerTitle>
              <DrawerDescription>Narrow down by pace, distance, and ride type.</DrawerDescription>
            </DrawerHeader>
            <div className="flex flex-wrap gap-2 pb-2">
              <Badge variant="outline">Relaxed</Badge>
              <Badge variant="outline">Cruising</Badge>
              <Badge variant="outline">Fast</Badge>
            </div>
            <DrawerFooter>
              <Button>Apply filters</Button>
              <DrawerClose render={<Button variant="ghost">Cancel</Button>} />
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </Section>

      <Section title="Toast">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() =>
              toast.success({
                title: "Ride created",
                description: "Your loop to Nandi Hills is live.",
              })
            }
          >
            Success toast
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.warning({
                title: "Only 2 seats left",
                description: "Request soon before it fills up.",
              })
            }
          >
            Warning toast
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.error({
                title: "Couldn't send request",
                description: "Check your connection and try again.",
              })
            }
          >
            Error toast
          </Button>
        </div>
      </Section>

      <Section title="Bottom navigation" description="Mobile only — fixed, backdrop-blurred.">
        <div className="border-border bg-background relative mx-auto h-20 w-full max-w-sm overflow-hidden rounded-2xl border">
          <div className="border-border/60 absolute inset-x-0 bottom-0 flex items-stretch justify-around border-t px-2 pt-1 pb-2">
            {[
              { icon: Home, label: "Home", active: true },
              { icon: Compass, label: "Discover", active: false },
              { icon: UserRound, label: "Profile", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${item.active ? "text-primary" : "text-muted-foreground"}`}
              >
                <item.icon className="size-5" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Loading skeletons">
        <div className="grid gap-4 sm:grid-cols-3">
          <RideCardSkeleton />
          <div className="flex flex-col gap-2 sm:col-span-2">
            <ListRowSkeleton />
            <ListRowSkeleton />
            <ListRowSkeleton />
          </div>
        </div>
      </Section>

      <Section title="Empty, error & success states">
        <div className="grid gap-4 sm:grid-cols-3">
          <EmptyState title="No rides yet" description="Be the first to plan one this weekend." />
          <ErrorState title="Couldn't load rides" description="Something went wrong on our end." />
          <SuccessState
            title="Request sent"
            description="You'll get notified once the organizer responds."
          />
        </div>
      </Section>

      <Section title="Map container">
        <MapContainer badge="18 km · Cruising" className="max-w-2xl">
          <div className="from-secondary via-secondary/70 to-primary/20 flex h-full items-center justify-center bg-linear-to-br text-white/40">
            Map embed goes here
          </div>
        </MapContainer>
      </Section>

      <Section title="Image gallery">
        <ImageGallery
          className="max-w-2xl"
          images={[
            { url: PHOTO("gallery-1", 900, 600) },
            { url: PHOTO("gallery-2", 900, 600) },
            { url: PHOTO("gallery-3", 900, 600) },
            { url: PHOTO("gallery-4", 900, 600) },
            { url: PHOTO("gallery-5", 900, 600) },
            { url: PHOTO("gallery-6", 900, 600) },
          ]}
        />
      </Section>

      <Section title="Chat bubbles">
        <div className="flex max-w-md flex-col gap-3">
          <ChatBubble
            body="Meeting point is the toll plaza, 6:30 sharp"
            timestamp="06:12"
            senderName="Rahul"
            senderImageUrl={PHOTO("rider-1", 96, 96)}
          />
          <ChatBubble
            body="Got it, bringing an extra helmet just in case"
            timestamp="06:14"
            isOwn
          />
        </div>
      </Section>

      <Section title="Iconography" description="lucide-react — 1.5-2px stroke, 16/20/24px sizes.">
        <div className="flex flex-wrap items-center gap-6">
          {[Bike, Compass, MapPin, Users, MountainSnow, Calendar].map((Icon, i) => (
            <Icon key={i} className="text-primary size-6" />
          ))}
        </div>
      </Section>

      <Reveal>
        <Card className="border-border border">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="font-heading text-xl font-bold">This is the foundation — not a page.</p>
            <p className="text-muted-foreground max-w-md text-sm">
              Every future RevLoop screen is composed from the tokens and components above. No
              redesigned pages ship until this system is signed off.
            </p>
            <Button
              nativeButton={false}
              render={<Link href="/">Back to home</Link>}
              variant="outline"
            />
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section className="flex flex-col gap-5">
        <div className="border-border flex flex-col gap-1 border-b pb-3">
          <h2 className="font-heading text-2xl font-bold tracking-tight">{title}</h2>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
        {children}
      </section>
    </Reveal>
  );
}
