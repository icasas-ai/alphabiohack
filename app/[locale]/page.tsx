import { BlogSection } from "@/components/sections/blog"
import { HeroSection } from "@/components/sections/hero"
import { MedicalFooter } from "@/components/layout/footer"
import { MedicalHeader } from "@/components/layout/header"
import { SpecialtiesSection } from "@/components/sections/specialties"
import { featureFlags } from "@/lib/config/features"
import { getPublicCompanyLocations, getPublicCompanyProfile } from "@/services/public-profile.service"

export default async function HomePage() {
  const { blog } = featureFlags.features
  const { services } = featureFlags.features
  const [publicCompany, locations] = await Promise.all([
    getPublicCompanyProfile(),
    getPublicCompanyLocations(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
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
        {blog && <BlogSection />}
        {services && <SpecialtiesSection />}
      </main>
      <MedicalFooter />
    </div>
  )
}
