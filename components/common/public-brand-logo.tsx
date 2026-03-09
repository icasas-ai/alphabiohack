"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

type PublicBrandLogoProps = {
  src?: string | null;
  alt: string;
  variant?: "header" | "footer" | "hero" | "showcase";
  className?: string;
  imageClassName?: string;
  fallbackSrc?: string;
};

const variantClasses = {
  header: {
    frame: "relative flex h-10 w-[170px] items-center sm:h-11 sm:w-[210px]",
    shell: "relative h-full w-full overflow-hidden rounded-xl bg-background/80 shadow-sm ring-1 ring-white/10",
    image: "object-cover object-center",
    sizes: "(max-width: 640px) 170px, 210px",
  },
  footer: {
    frame: "relative flex h-20 w-full max-w-[320px] items-center",
    shell: "relative h-full w-full overflow-hidden px-3 py-2",
    image: "object-contain object-left",
    sizes: "(max-width: 768px) 280px, 320px",
  },
  hero: {
    frame:
      "relative aspect-square w-full max-w-[220px] sm:max-w-[320px]",
    shell:
      "relative h-full w-full overflow-hidden rounded-full bg-background shadow-2xl ring-1 ring-white/10",
    image: "rounded-full object-cover object-center",
    sizes: "(max-width: 640px) 220px, 320px",
  },
  showcase: {
    frame: "relative inline-flex max-w-full items-center justify-center",
    shell: "relative inline-flex max-w-full items-center justify-center overflow-hidden rounded-[20px]",
    image: "block h-auto max-h-44 w-auto max-w-full object-contain object-center sm:max-h-56 sm:max-w-[24rem] lg:max-h-64 lg:max-w-[26rem]",
    sizes: "(max-width: 640px) 288px, 352px",
  },
} as const;

export function PublicBrandLogo({
  src,
  alt,
  variant = "header",
  className,
  imageClassName,
  fallbackSrc = "/images/logo.png",
}: PublicBrandLogoProps) {
  const resolvedSrc = src || fallbackSrc;
  const config = variantClasses[variant];
  const baseImageClassName = cn("h-full w-full", config.image, imageClassName);

  if (variant === "showcase") {
    return (
      <div className={cn(config.frame, className)}>
        <div className={config.shell}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedSrc}
            alt={alt}
            className={baseImageClassName}
            decoding="async"
            loading="eager"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(config.frame, className)}>
      <div className={config.shell}>
        {resolvedSrc.startsWith("data:image") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolvedSrc} alt={alt} className={baseImageClassName} />
        ) : (
          <Image
            src={resolvedSrc}
            alt={alt}
            fill
            sizes={config.sizes}
            className={baseImageClassName}
          />
        )}
      </div>
    </div>
  );
}
