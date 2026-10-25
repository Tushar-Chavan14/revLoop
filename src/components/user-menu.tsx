"use client";

import { useTransition } from "react";
import Link from "next/link";
import { ChevronDown, Compass, LogOut, PenLine, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/features/auth/actions/auth-actions";

interface UserMenuProps {
  name: string;
  username?: string | null;
  avatarUrl?: string | null;
  isOrganizer?: boolean;
}

export function UserMenu({ name, username, avatarUrl, isOrganizer }: UserMenuProps) {
  const [isPending, startTransition] = useTransition();
  const firstName = name.split(" ")[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hover:bg-muted flex items-center gap-1.5 rounded-md py-1 pr-1.5 pl-1 text-sm font-semibold transition-colors outline-none">
        <Avatar size="sm">
          <AvatarImage src={avatarUrl ?? undefined} alt={name} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <span className="hidden sm:inline">{firstName}</span>
        <ChevronDown className="text-muted-foreground size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <p className="truncate font-medium">{name}</p>
          {username && <p className="text-muted-foreground truncate text-xs">@{username}</p>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/profile" />}>
          <UserRound />
          {isOrganizer ? "Organizer home" : "Ride home"}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/profile/rides" />}>
          <Compass />
          My rides
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/profile/edit" />}>
          <PenLine />
          Edit profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isPending}
          onClick={() => startTransition(() => signOut())}
          className="text-destructive hover:bg-destructive/10 data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
        >
          <LogOut />
          {isPending ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
