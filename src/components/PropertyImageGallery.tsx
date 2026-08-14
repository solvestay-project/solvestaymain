"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_VISIBLE = 3;
const SIDE_SLOTS = [1, 2] as const;

type PropertyImageGalleryProps = {
  images: string[];
  title: string;
  onImageClick: (index: number) => void;
  onShare?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  showSave?: boolean;
};

export function PropertyImageGallery({
  images,
  title,
  onImageClick,
  onShare,
  onFavorite,
  isFavorite = false,
  showSave = true,
}: PropertyImageGalleryProps) {
  const count = images.length;
  if (count === 0) return null;

  const extraCount = Math.max(0, count - MAX_VISIBLE);

  const openAt = (index: number) => onImageClick(index);

  return (
    <div className="relative">
      {(onShare || (showSave && onFavorite)) && (
        <div className="absolute top-3 right-3 z-20 flex gap-2">
          {onShare && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-lg bg-white/95 shadow-md backdrop-blur-sm hover:bg-white"
              onClick={onShare}
            >
              <Share2 className="w-4 h-4 mr-1.5" />
              Share
            </Button>
          )}
          {showSave && onFavorite && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-lg bg-white/95 shadow-md backdrop-blur-sm hover:bg-white"
              onClick={onFavorite}
            >
              <Heart
                className={cn(
                  "w-4 h-4 mr-1.5",
                  isFavorite && "fill-red-500 text-red-500",
                )}
              />
              Save
            </Button>
          )}
        </div>
      )}

      {/* Mobile: hero + 2 thumbnails */}
      <div className="flex flex-col gap-2 sm:hidden">
        <GalleryTile
          src={images[0]}
          alt={`${title} - cover`}
          className="h-52 w-full rounded-xl"
          onClick={() => openAt(0)}
          priority
        />
        {count > 1 && (
          <div className="grid grid-cols-2 gap-1.5 h-28">
            {SIDE_SLOTS.map((idx) => {
              if (idx >= count) {
                return (
                  <div
                    key={idx}
                    className="rounded-lg bg-muted/40"
                    aria-hidden
                  />
                );
              }
              const showMore = idx === 2 && extraCount > 0;
              return (
                <GalleryTile
                  key={idx}
                  src={images[idx]}
                  alt={`${title} - ${idx + 1}`}
                  className="h-full w-full rounded-lg"
                  onClick={() => openAt(showMore ? MAX_VISIBLE : idx)}
                  overlay={
                    showMore ? `+ ${extraCount} more` : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Tablet / desktop: large left + 2 stacked right */}
      <div
        className={cn(
          "hidden gap-2 sm:grid",
          count === 1
            ? "grid-cols-1 h-[280px] lg:h-[420px]"
            : "grid-cols-4 grid-rows-2 h-[260px] lg:h-[420px]",
        )}
      >
        <GalleryTile
          src={images[0]}
          alt={`${title} - cover`}
          className={cn(
            "rounded-xl",
            count > 1 && "col-span-2 row-span-2",
          )}
          onClick={() => openAt(0)}
          priority
        />

        {count > 1 &&
          SIDE_SLOTS.map((idx) => {
            if (idx >= count) {
              return (
                <div
                  key={idx}
                  className="col-span-2 rounded-xl bg-muted/30"
                  aria-hidden
                />
              );
            }
            const showMore = idx === 2 && extraCount > 0;
            return (
              <GalleryTile
                key={idx}
                src={images[idx]}
                alt={`${title} - ${idx + 1}`}
                className="col-span-2 rounded-xl"
                onClick={() => openAt(showMore ? MAX_VISIBLE : idx)}
                overlay={
                  showMore ? `+ ${extraCount} more` : undefined
                }
              />
            );
          })}
      </div>
    </div>
  );
}

function GalleryTile({
  src,
  alt,
  className,
  onClick,
  overlay,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  onClick: () => void;
  overlay?: string;
  priority?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "relative overflow-hidden bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className,
      )}
      onClick={onClick}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover transition-transform duration-300 hover:scale-[1.03]"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 40vw"
      />
      {overlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 transition-colors hover:bg-black/58">
          <span className="text-base font-semibold text-white sm:text-lg">
            {overlay}
          </span>
        </div>
      )}
    </button>
  );
}
