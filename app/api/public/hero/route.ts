import { NextResponse } from "next/server";
import { getPublicCompanyProfile } from "@/services/public-profile.service";

export async function GET() {
  try {
    const company = await getPublicCompanyProfile();

    if (!company) {
      return NextResponse.json(
        { error: "No company information found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      name: company.name,
      publicSpecialty: company.publicSpecialty,
      publicSummary: company.publicSummary,
      logo: company.logo,
    });
  } catch (error) {
    console.error("Error fetching hero info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
