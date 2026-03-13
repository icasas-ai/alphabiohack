import { jsonError, jsonSuccess } from "@/lib/api/route-helpers";
import { getPublicCompanyProfile } from "@/services/public-profile.service";
import { isPublicSiteUnavailableError } from "@/services/company.service";

export async function GET() {
  try {
    const company = await getPublicCompanyProfile();

    if (!company) {
      return jsonError("No business information found", 404);
    }

    return jsonSuccess({
      name: company.name,
      logo: company.logo,
      headerLogo: company.headerLogo,
      publicSummary: company.publicSummary,
      email: company.publicEmail,
      telefono: company.publicPhone,
      informacionPublica: company.publicDescription,
      weekdaysHours: company.weekdaysHours,
      saturdayHours: company.saturdayHours,
      sundayHours: company.sundayHours,
      facebook: company.facebook,
      instagram: company.instagram,
      linkedin: company.linkedin,
      twitter: company.twitter,
      tiktok: company.tiktok,
      youtube: company.youtube,
      website: company.website,
    });
  } catch (error) {
    if (isPublicSiteUnavailableError(error)) {
      return jsonError("Public site unavailable", 503);
    }

    console.error("Error fetching contact info:", error);
    return jsonError("Internal server error", 500);
  }
}
