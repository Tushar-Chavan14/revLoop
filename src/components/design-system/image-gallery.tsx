"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: { url: string; alt?: string }[];
  className?: string;
}

/** A ride's photo grid — tap any tile to open a full-bleed lightbox with prev/next. */
export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (images.length === 0) {
    return null;
  }

  const featured = images[0];
  const rest = images.slice(1, 5);

  return (
    <>
      <div className={cn("grid grid-cols-4 grid-rows-2 gap-2", className)}>
        <button
          type="button"
          onClick={() => setOpenIndex(0)}
          className="focus-visible:ring-primary relative col-span-2 row-span-2 overflow-hidden rounded-2xl outline-none focus-visible:ring-2"
        >
          <Image
            src={featured.url}
            alt={featured.alt ?? ""}
            fill
            unoptimized
            className="object-cover"
          />
        </button>
        {rest.map((image, index) => (
          <button
            key={image.url}
            type="button"
            onClick={() => setOpenIndex(index + 1)}
            className="focus-visible:ring-primary relative overflow-hidden rounded-2xl outline-none focus-visible:ring-2"
          >
            <Image
              src={image.url}
              alt={image.alt ?? ""}
              fill
              unoptimized
              className="object-cover"
            />
            {index === 3 && images.length > 5 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                +{images.length - 5}
              </span>
            )}
          </button>
        ))}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-w-3xl bg-black p-0 ring-0" showClose={false}>
          {openIndex !== null && (
            <div className="relative aspect-4/3 w-full">
              <Image
                src={images[openIndex].url}
                alt={images[openIndex].alt ?? ""}
                fill
                unoptimized
                className="object-contain"
              />
              <DialogClose
                aria-label="Close"
                className="absolute top-3 right-3 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20"
              >
                <X className="size-5" />
              </DialogClose>
              {openIndex > 0 && (
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() => setOpenIndex((i) => (i === null ? i : i - 1))}
                  className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20"
                >
                  <ChevronLeft className="size-5" />
                </button>
              )}
              {openIndex < images.length - 1 && (
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() => setOpenIndex((i) => (i === null ? i : i + 1))}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20"
                >
                  <ChevronRight className="size-5" />
                </button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
