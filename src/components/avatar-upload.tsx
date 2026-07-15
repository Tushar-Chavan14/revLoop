"use client";

import { useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { Camera, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

interface AvatarUploadProps {
  name: string;
  previewUrl: string | null;
  onFileSelect: (file: File, previewUrl: string) => void;
  onError: (message: string) => void;
  size?: number;
}

export function AvatarUpload({
  name,
  previewUrl,
  onFileSelect,
  onError,
  size = 96,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      onError("Please choose an image file");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      onError("Image must be under 5MB");
      return;
    }

    onFileSelect(file, URL.createObjectURL(file));
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "group bg-secondary ring-primary/10 relative shrink-0 overflow-hidden rounded-full ring-4",
        )}
        style={{ width: size, height: size }}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Profile photo"
            width={size}
            height={size}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-secondary-foreground/40 flex h-full w-full items-center justify-center">
            <UserRound className="size-1/2" />
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Change profile photo"
          className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white focus-visible:bg-black/40 focus-visible:text-white focus-visible:outline-none"
        >
          <Camera className="size-6" />
        </button>
      </div>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-foreground text-left text-sm font-medium hover:underline"
        >
          {previewUrl ? "Change photo" : "Add a photo"}
        </button>
        <p className="text-muted-foreground text-xs">JPG, PNG or WEBP. Up to 5MB.</p>
      </div>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
