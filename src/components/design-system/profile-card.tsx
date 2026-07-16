import { Bike, MapPin } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProfileCardProps {
  name: string;
  username: string;
  imageUrl?: string | null;
  location?: string | null;
  bike?: string | null;
  riderLevel?: string | null;
  className?: string;
  action?: React.ReactNode;
}

/** A rider's identity card — directory listings, ride participant lists, join-request rows. */
export function ProfileCard({
  name,
  username,
  imageUrl,
  location,
  bike,
  riderLevel,
  action,
  className,
}: ProfileCardProps) {
  return (
    <div
      data-slot="profile-card"
      className={cn(
        "bg-card ring-foreground/10 flex items-center gap-4 rounded-2xl p-4 ring-1",
        className,
      )}
    >
      <Avatar size="lg">
        <AvatarImage src={imageUrl ?? undefined} alt={name} />
        <AvatarFallback>{name[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-heading truncate font-semibold">{name}</p>
          {riderLevel && (
            <Badge variant="outline" className="text-muted-foreground shrink-0">
              {riderLevel}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground truncate text-sm">@{username}</p>
        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3" aria-hidden />
              {location}
            </span>
          )}
          {bike && (
            <span className="flex items-center gap-1">
              <Bike className="size-3" aria-hidden />
              {bike}
            </span>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
