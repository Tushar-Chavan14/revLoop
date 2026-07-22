"use client";

import { useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { Camera, ImageIcon } from "lucide-react";

const MAX_COVER_BYTES = 5 * 1024 * 1024;

interface CoverImageUploadProps {
  name: string;
  previewUrl: string | null;
  onFileSelect: (file: File, previewUrl: string) => void;
  onError: (message: string) => void;
}

export function CoverImageUpload({
  name,
  previewUrl,
  onFileSelect,
  onError,
}: CoverImageUploadProps) {
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
    if (file.size > MAX_COVER_BYTES) {
      onError("Image must be under 5MB");
      return;
    }

    onFileSelect(file, URL.createObjectURL(file));
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group border-border bg-secondary/50 relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-dashed"
      >
        {previewUrl ? (
          <Image src={previewUrl} alt="Ride cover" fill unoptimized className="object-cover" />
        ) : (
          <div className="text-muted-foreground flex flex-col items-center gap-1.5">
            <ImageIcon className="size-6" />
            <span className="text-sm">Add A Cover Photo</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
          <Camera className="size-6" />
        </div>
      </button>
      <p className="text-muted-foreground text-xs">JPG, PNG or WEBP. Up to 5MB.</p>
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
