import { PublicSiteUnavailableSplash } from "@/components/common/public-site-unavailable-splash"
import { BlogSection } from "@/components/sections/blog"
import { HomeBodySection } from "@/components/sections/home-body"
import { HeroSection } from "@/components/sections/hero"
import { ThemeStyleBridge } from "@/components/company/theme-style-bridge"
import { MedicalFooter } from "@/components/layout/footer"
import { MedicalHeader } from "@/components/layout/header"
import { SpecialtiesSection } from "@/components/sections/specialties"
import { getCompanyThemeStyle } from "@/lib/company/company-theme"
import {
  normalizeLandingPageLocale,
  resolveLandingPageConfigForLocale,
} from "@/lib/company/landing-page-config"
import { featureFlags } from "@/lib/config/features"
import { isPublicSiteUnavailableError } from "@/services/company.service"
import { getPublicCompanyLocations, getPublicCompanyProfile } from "@/services/public-profile.service"

export const dynamic = "force-dynamic"

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const landingLocale = normalizeLandingPageLocale(locale)
  const { blog } = featureFlags.features
  const { services } = featureFlags.features

  try {
    const [publicCompany, locations] = await Promise.all([
      getPublicCompanyProfile(),
      getPublicCompanyLocations(),
    ])
    const publicThemeStyle = getCompanyThemeStyle(
      publicCompany?.landingPageConfig,
      "public",
    )
    const landingPageConfig = resolveLandingPageConfigForLocale(
      publicCompany?.landingPageConfig,
      landingLocale,
    )

    return (
      <div className="app-page-gradient flex min-h-screen flex-col" style={publicThemeStyle}>
        <ThemeStyleBridge style={publicThemeStyle} />
        <MedicalHeader />
        <main id="home-page-main" className="flex flex-1 flex-col">
          {landingPageConfig.hero.visible ? (
            <HeroSection
              initialPublicData={
                publicCompany
                  ? {
                      name: publicCompany.name,
                      publicSpecialty: publicCompany.publicSpecialty,
                      publicSummary: publicCompany.publicSummary,
                      logo: publicCompany.logo,
                    }
                  : null
              }
              initialLocations={locations}
              content={landingPageConfig.hero}
            />
          ) : null}
          <HomeBodySection
            locations={locations}
            content={{
              support: landingPageConfig.support,
              journey: landingPageConfig.journey,
              locations: landingPageConfig.locations,
            }}
          />
          {blog && landingPageConfig.blog.visible ? (
            <BlogSection content={landingPageConfig.blog} />
          ) : null}
          {services && landingPageConfig.specialties.visible ? (
            <SpecialtiesSection content={landingPageConfig.specialties} />
          ) : null}
        </main>
        <MedicalFooter />
      </div>
    )
  } catch (error) {
    if (isPublicSiteUnavailableError(error)) {
      return (
        <div className="app-page-gradient flex min-h-screen flex-col">
          <MedicalHeader />
          <main className="flex flex-1 flex-col">
            <PublicSiteUnavailableSplash />
          </main>
          <MedicalFooter />
        </div>
      )
    }

    throw error
  }
}
