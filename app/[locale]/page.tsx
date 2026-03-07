import { BlogSection } from "@/components/sections/blog"
import { HomeBodySection } from "@/components/sections/home-body"
import { HeroSection } from "@/components/sections/hero"
import { MedicalFooter } from "@/components/layout/footer"
import { MedicalHeader } from "@/components/layout/header"
import { SpecialtiesSection } from "@/components/sections/specialties"
import { featureFlags } from "@/lib/config/features"
import { getPublicCompanyLocations, getPublicCompanyProfile, getPublicProfile } from "@/services/public-profile.service"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const { blog } = featureFlags.features
  const { services } = featureFlags.features
  const [publicCompanyResult, locationsResult, publicProfileResult] = await Promise.allSettled([
    getPublicCompanyProfile(),
    getPublicCompanyLocations(),
    getPublicProfile(),
  ])
  const publicCompany =
    publicCompanyResult.status === "fulfilled" ? publicCompanyResult.value : null
  const locations = locationsResult.status === "fulfilled" ? locationsResult.value : []
  const publicProfile =
    publicProfileResult.status === "fulfilled" ? publicProfileResult.value : null

  return (
    <div className="app-page-gradient flex min-h-screen flex-col">
      <MedicalHeader />
      <main className="flex flex-1 flex-col">
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
        />
        <HomeBodySection
          company={publicCompany}
          therapist={publicProfile}
          locations={locations}
        />
        {blog && <BlogSection />}
        {services && <SpecialtiesSection />}
      </main>
      <MedicalFooter />
    </div>
  )
}
