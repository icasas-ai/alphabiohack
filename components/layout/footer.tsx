"use client"

import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react"

import { CONTACT_INFO } from "@/constants"
import { PublicBrandLogo } from "@/components/common/public-brand-logo"
import Link from "next/link"
import { Link as LocalizedLink } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

export function MedicalFooter() {
  const t = useTranslations('Footer')
  const brandName = CONTACT_INFO.BRAND_NAME
  const publicAddress = CONTACT_INFO.ADDRESS
  const publicPhone = CONTACT_INFO.PHONE
  const publicEmail = CONTACT_INFO.EMAIL
  const publicSummary = t('description')
  const facebookLink = CONTACT_INFO.SOCIAL_MEDIA.FACEBOOK
  const instagramLink = CONTACT_INFO.SOCIAL_MEDIA.INSTAGRAM
  const linkedinLink = CONTACT_INFO.SOCIAL_MEDIA.LINKEDIN
  const twitterLink = CONTACT_INFO.SOCIAL_MEDIA.TWITTER

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4 max-w-[320px]">
            <div className="w-full">
              <LocalizedLink href="/" className="block">
                <PublicBrandLogo
                  src="/images/logo.png"
                  alt={`${brandName} logo`}
                  variant="footer"
                />
              </LocalizedLink>
            </div>
            <p className="max-w-[320px] text-secondary-foreground/80 text-sm leading-relaxed">
              {publicSummary}
            </p>
            <div className="flex space-x-4">
              <Link href={facebookLink} className="text-secondary-foreground/80 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href={twitterLink} className="text-secondary-foreground/80 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href={linkedinLink} className="text-secondary-foreground/80 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href={instagramLink} className="text-secondary-foreground/80 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          

          {/* For Doctors */}
          <div className="space-y-4 md:mx-auto">
            <h4 className="text-lg font-semibold">{t('forDoctors')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <p className="text-secondary-foreground/60">
                  {t('therapistAccessDescription')}
                </p>
              </li>
              <li>
                <LocalizedLink href="/auth/login" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
                  {t('therapistSignIn')}
                </LocalizedLink>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t('contactUs')}</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 mt-1 shrink-0" />
                <span className="text-secondary-foreground/80">
                  {publicAddress}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 shrink-0" />
                <span className="text-secondary-foreground/80">{publicPhone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="text-secondary-foreground/80">{publicEmail}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-foreground/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-secondary-foreground/80 text-sm">
              © {new Date().getFullYear()} {brandName}. {t('copyright')}
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href={CONTACT_INFO.TERMS_AND_CONDITIONS} className="text-secondary-foreground/80 hover:text-primary transition-colors">
                {t('termsAndConditions')}
              </Link>
              <Link href={CONTACT_INFO.PRIVACY_POLICY} className="text-secondary-foreground/80 hover:text-primary transition-colors">
                {t('privacyPolicy')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
