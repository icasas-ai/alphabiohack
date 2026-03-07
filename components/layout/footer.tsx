import { ArrowRight, Globe, Mail } from "lucide-react"

import { PLATFORM_INFO } from "@/constants"
import { PublicBrandLogo } from "@/components/common/public-brand-logo"
import Link from "next/link"
import { Link as LocalizedLink } from "@/i18n/navigation"
import { getSiteUrl } from "@/lib/config/site-url"
import { getTranslations } from "next-intl/server"
import { getDefaultEmailConfig } from "@/services/config.service"

function extractEmailAddress(value: string) {
  const match = value.match(/<([^>]+)>/)
  return match?.[1] ?? value
}

export async function MedicalFooter() {
  const t = await getTranslations("Footer")

  const brandName = PLATFORM_INFO.BRAND_NAME
  const footerLogo = PLATFORM_INFO.LOGO
  const platformSummary = t("description")
  const siteUrl = getSiteUrl()
  const siteHost = new URL(siteUrl).host
  const supportEmail =
    process.env.BOOKING_REPLY_TO || extractEmailAddress(getDefaultEmailConfig().from)

  return (
    <footer className="mt-16 border-t border-border/60 bg-[linear-gradient(180deg,oklch(var(--accent)/0.08)_0%,oklch(var(--background))_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.72fr_0.95fr]">
          <div className="space-y-5">
            <LocalizedLink href="/" className="block">
              <PublicBrandLogo
                src={footerLogo}
                alt={`${brandName} logo`}
                variant="footer"
              />
            </LocalizedLink>
            <div className="max-w-xl space-y-3">
              <p className="text-xl font-semibold tracking-tight text-foreground">
                {brandName}
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                {platformSummary}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/72">
              {t("forDoctors")}
            </h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="leading-7">{t("therapistAccessDescription")}</p>
              <LocalizedLink
                href="/auth/login"
                className="inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:text-primary"
              >
                {t("therapistSignIn")}
                <ArrowRight className="h-4 w-4" />
              </LocalizedLink>
              <div className="space-y-2 pt-2">
                <LocalizedLink href="/booking" className="block transition-colors hover:text-primary">
                  {t("booking")}
                </LocalizedLink>
                <LocalizedLink href="/contact" className="block transition-colors hover:text-primary">
                  {t("contactUs")}
                </LocalizedLink>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/72">
              {t("contactUs")}
            </h4>
            <div className="space-y-4 text-sm text-muted-foreground">
              {supportEmail ? (
                <Link
                  href={`mailto:${supportEmail}`}
                  className="flex items-center gap-3 transition-colors hover:text-primary"
                >
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  <span>{supportEmail}</span>
                </Link>
              ) : null}
              <Link
                href={siteUrl}
                className="flex items-center gap-3 transition-colors hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe className="h-4 w-4 shrink-0 text-primary" />
                <span>{siteHost}</span>
              </Link>
              <LocalizedLink
                href="/contact"
                className="inline-flex items-center gap-2 font-medium text-foreground transition-colors hover:text-primary"
              >
                {t("contactUs")}
                <ArrowRight className="h-4 w-4" />
              </LocalizedLink>
              <p className="text-xs leading-6 text-muted-foreground/85">
                {t("therapistAccessDescription")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border/60 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {brandName}. {t("copyright")}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <LocalizedLink href="/booking" className="transition-colors hover:text-primary">
              {t("booking")}
            </LocalizedLink>
            <LocalizedLink href="/contact" className="transition-colors hover:text-primary">
              {t("contactUs")}
            </LocalizedLink>
            <LocalizedLink href="/auth/login" className="transition-colors hover:text-primary">
              {t("therapistSignIn")}
            </LocalizedLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
