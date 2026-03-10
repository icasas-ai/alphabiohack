"use client"

import { Mail, Menu, Phone, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CONTACT_INFO } from "@/constants"
import { LanguageSelector } from "@/components/common/language-selector"
import { PublicBrandLogo } from "@/components/common/public-brand-logo"
import { Link as LocalizedLink } from "@/i18n/navigation"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { useEffect, useRef, useState } from "react"
import { readJsonResponse } from "@/lib/utils/read-json-response"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

interface PublicContactData {
  name?: string | null
  logo?: string | null
  headerLogo?: string | null
  email?: string | null
  telefono?: string | null
}

interface MedicalHeaderProps {
  initialPublicContact?: PublicContactData | null;
  sticky?: boolean;
}

export function MedicalHeader({
  initialPublicContact = null,
  sticky = true,
}: MedicalHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [publicContact, setPublicContact] = useState<PublicContactData | null>(
    initialPublicContact
  )
  const [isPublicContactLoading, setIsPublicContactLoading] = useState(!initialPublicContact)
  const headerRef = useRef<HTMLElement>(null)
  const t = useTranslations('Navigation')

  useEffect(() => {
    if (initialPublicContact) {
      setIsPublicContactLoading(false)
      return;
    }

    const fetchPublicContact = async () => {
      setIsPublicContactLoading(true)
      try {
        const response = await fetch("/api/public/contact")
        if (!response.ok) {
          return
        }

        const data = await readJsonResponse<PublicContactData>(response)
        setPublicContact(data)
      } catch (error) {
        console.error("Error fetching public header contact data:", error)
      } finally {
        setIsPublicContactLoading(false)
      }
    }

    fetchPublicContact()
  }, [initialPublicContact])

  useEffect(() => {
    if (!sticky) {
      document.documentElement.style.removeProperty("--visible-header-offset")
      return
    }

    const headerElement = headerRef.current
    if (!headerElement) {
      return
    }

    const setHeaderOffset = () => {
      const height = headerElement.getBoundingClientRect().height
      document.documentElement.style.setProperty("--visible-header-offset", `${height}px`)
    }

    setHeaderOffset()

    const resizeObserver = new ResizeObserver(() => {
      setHeaderOffset()
    })

    resizeObserver.observe(headerElement)
    window.addEventListener("resize", setHeaderOffset)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", setHeaderOffset)
      document.documentElement.style.removeProperty("--visible-header-offset")
    }
  }, [sticky])

  const showPublicContactSkeleton = isPublicContactLoading && !publicContact
  const publicEmail = publicContact?.email || (!showPublicContactSkeleton ? CONTACT_INFO.EMAIL : "")
  const publicPhone = publicContact?.telefono || (!showPublicContactSkeleton ? CONTACT_INFO.PHONE : "")
  const brandName = publicContact?.name || (!showPublicContactSkeleton ? CONTACT_INFO.BRAND_NAME : "")

  const navigation = [
    { name: t('home'), href: "/" as const },
    { name: t('contact'), href: "/contact" as const },
    { name: t('booking'), href: "/booking" as const },
  ]
  const shellClassName = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8"

  return (
    <header
      ref={headerRef}
      className={cn(
        "bg-background border-b border-border",
        sticky ? "sticky top-0 z-50" : "relative z-10",
      )}
    >
      <div className="bg-muted/30 border-b border-border">
        <div className={shellClassName}>
          <div className="flex justify-between items-center h-10 text-sm">
            {/* Contact Info */}
            <div className="hidden md:flex items-center space-x-6 text-muted-foreground">
              {showPublicContactSkeleton ? (
                <>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <Skeleton className="h-3 w-44 rounded-sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <Skeleton className="h-3 w-32 rounded-sm" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    <span>{publicEmail}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    <span>{publicPhone}</span>
                  </div>
                </>
              )}
            </div>

            {/* Utility Buttons */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className={shellClassName}>
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="shrink-0">
            <LocalizedLink href="/" className="block">
              {showPublicContactSkeleton ? (
                <Skeleton className="h-8 w-40 sm:h-10 sm:w-52 rounded-md" />
              ) : publicContact?.headerLogo ? (
                <PublicBrandLogo
                  src={publicContact.headerLogo}
                  alt={`${brandName} logo`}
                  variant="header"
                />
              ) : (
                <span className="inline-flex max-w-[240px] items-center text-lg font-semibold tracking-[0.08em] text-primary sm:text-xl">
                  {brandName}
                </span>
              )}
            </LocalizedLink>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <LocalizedLink
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors duration-200"
              >
                {item.name}
              </LocalizedLink>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border-t border-border">
              {navigation.map((item) => (
                <LocalizedLink
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-foreground hover:text-primary transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </LocalizedLink>
              ))}
              <div className="px-3 py-2 border-t border-border mt-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">{t('settings')}</span>
                  <div className="flex items-center space-x-2">
                    <ThemeToggle />
                    <LanguageSelector />
                  </div>
                </div>
                {showPublicContactSkeleton ? (
                  <>
                    <div className="flex items-center mb-2">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Skeleton className="h-4 w-44 rounded-sm" />
                    </div>
                    <div className="flex items-center mb-3">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Skeleton className="h-4 w-36 rounded-sm" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{publicEmail}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{publicPhone}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
