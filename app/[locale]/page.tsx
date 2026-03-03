import { BlogSection } from "@/components/sections/blog"
import { HeroSection } from "@/components/sections/hero"
import { MedicalFooter } from "@/components/layout/footer"
import { MedicalHeader } from "@/components/layout/header"
import { SpecialtiesSection } from "@/components/sections/specialties"
import { featureFlags } from "@/lib/config/features"
import { getPublicCompanyLocations, getPublicProfile } from "@/services/public-profile.service"

export default async function HomePage() {
  const { blog } = featureFlags.features
  const { services } = featureFlags.features
  const [publicProfile, locations] = await Promise.all([
    getPublicProfile(),
    getPublicCompanyLocations(),
  ])

  return (
    <div className="min-h-screen">
      <MedicalHeader />
      <main>
        <HeroSection
          initialPublicData={
            publicProfile
              ? {
                  firstname: publicProfile.firstname,
                  lastname: publicProfile.lastname,
                  especialidad: publicProfile.especialidad,
                  summary: publicProfile.summary,
                  avatar: publicProfile.avatar,
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
