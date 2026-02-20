"use client";

import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Globe,
} from "lucide-react";

interface SocialLinksProps {
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  website?: string | null;
  className?: string;
  iconSize?: number;
}

export function SocialLinks({
  facebook,
  instagram,
  linkedin,
  twitter,
  tiktok,
  youtube,
  website,
  className = "",
  iconSize = 24,
}: SocialLinksProps) {
  const links = [
    { url: facebook, icon: Facebook, label: "Facebook", color: "hover:text-blue-600" },
    { url: instagram, icon: Instagram, label: "Instagram", color: "hover:text-pink-600" },
    { url: linkedin, icon: Linkedin, label: "LinkedIn", color: "hover:text-blue-700" },
    { url: twitter, icon: Twitter, label: "Twitter", color: "hover:text-blue-400" },
    { url: tiktok, icon: () => null, label: "TikTok", color: "hover:text-black" },
    { url: youtube, icon: Youtube, label: "YouTube", color: "hover:text-red-600" },
    { url: website, icon: Globe, label: "Website", color: "hover:text-gray-700" },
  ];

  // Filtrar solo los links que tienen URL
  const activeLinks = links.filter(
    (link): link is typeof link & { url: string } => typeof link.url === "string",
  );

  if (activeLinks.length === 0) {
    return null;
  }

  return (
    <div className={`flex gap-4 ${className}`}>
      {activeLinks.map((link, index) => {
        // Caso especial para TikTok que no tiene icono en lucide-react
        if (link.label === "TikTok") {
          return (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${link.color}`}
              aria-label={link.label}
              title={link.label}
            >
              <svg
                width={iconSize}
                height={iconSize}
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-full h-full"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.68v13.67a2.89 2.89 0 1 1-5.92-2.4 2.88 2.88 0 0 1 2.31 1.39V9.58a5.66 5.66 0 0 0-.74-.07q-5.18 0-5.18 5.1a5.1 5.1 0 0 0 5.12 5.1 5 5 0 0 0 5.15-4.9V12.9A6.12 6.12 0 0 0 20.75 14v-3.4a5.6 5.6 0 0 1-1.16.09Z" />
              </svg>
            </a>
          );
        }

        const Icon = link.icon;
        if (!Icon) return null;

        return (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-colors ${link.color}`}
            aria-label={link.label}
            title={link.label}
          >
            <Icon size={iconSize} />
          </a>
        );
      })}
    </div>
  );
}
