import { NextResponse } from "next/server";
import { getPublicCompanyProfile } from "@/services/public-profile.service";

export async function GET() {
  try {
    const company = await getPublicCompanyProfile();

    if (!company) {
      return NextResponse.json(
        { error: "No business information found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
    console.error("Error fetching contact info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
