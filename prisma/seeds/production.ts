import { CompanyMembershipRole, UserRole } from "@/lib/prisma-client";
import { prisma } from "@/lib/prisma";

type BootstrapConfig = {
  companySlug: string;
  companyName: string;
  companyTimezone: string;
  publicEmail?: string;
  publicPhone?: string;
  publicDescription?: string;
  publicSummary?: string;
  publicSpecialty?: string;
  ownerEmail: string;
  ownerSupabaseId?: string;
  ownerFirstname: string;
  ownerLastname: string;
  ownerAvatar?: string;
};

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required for db:seed:prod`);
  }

  return value;
}

function getOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function deriveNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "owner";
  const [first = "Practice", last = "Owner"] = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1));

  return {
    firstname: first,
    lastname: last,
  };
}

function getBootstrapConfig(): BootstrapConfig {
  const ownerEmail = getRequiredEnv("BOOTSTRAP_OWNER_EMAIL");
  const fallbackName = deriveNameFromEmail(ownerEmail);

  return {
    companySlug: getRequiredEnv("BOOTSTRAP_COMPANY_SLUG"),
    companyName: getRequiredEnv("BOOTSTRAP_COMPANY_NAME"),
    companyTimezone:
      getOptionalEnv("BOOTSTRAP_COMPANY_TIMEZONE") || "America/Los_Angeles",
    publicEmail: getOptionalEnv("BOOTSTRAP_PUBLIC_EMAIL"),
    publicPhone: getOptionalEnv("BOOTSTRAP_PUBLIC_PHONE"),
    publicDescription: getOptionalEnv("BOOTSTRAP_PUBLIC_DESCRIPTION"),
    publicSummary: getOptionalEnv("BOOTSTRAP_PUBLIC_SUMMARY"),
    publicSpecialty: getOptionalEnv("BOOTSTRAP_PUBLIC_SPECIALTY"),
    ownerEmail,
    ownerSupabaseId: getOptionalEnv("BOOTSTRAP_OWNER_SUPABASE_ID"),
    ownerFirstname:
      getOptionalEnv("BOOTSTRAP_OWNER_FIRSTNAME") || fallbackName.firstname,
    ownerLastname:
      getOptionalEnv("BOOTSTRAP_OWNER_LASTNAME") || fallbackName.lastname,
    ownerAvatar: getOptionalEnv("BOOTSTRAP_OWNER_AVATAR"),
  };
}

function mergeRoles(existingRoles: UserRole[]) {
  return Array.from(
    new Set([...existingRoles, UserRole.Admin, UserRole.Therapist]),
  );
}

async function resolveBootstrapOwner(config: BootstrapConfig) {
  const existingByEmail = await prisma.user.findUnique({
    where: { email: config.ownerEmail },
  });

  const existingBySupabaseId = config.ownerSupabaseId
    ? await prisma.user.findUnique({
        where: { supabaseId: config.ownerSupabaseId },
      })
    : null;

  if (
    existingByEmail &&
    existingBySupabaseId &&
    existingByEmail.id !== existingBySupabaseId.id
  ) {
    throw new Error(
      "BOOTSTRAP_OWNER_EMAIL and BOOTSTRAP_OWNER_SUPABASE_ID refer to different users.",
    );
  }

  const existingUser = existingByEmail || existingBySupabaseId;

  if (!existingUser) {
    if (!config.ownerSupabaseId) {
      throw new Error(
        "Owner user does not exist. Create the Supabase auth user first or provide BOOTSTRAP_OWNER_SUPABASE_ID so db:seed:prod can create the Prisma user row.",
      );
    }

    const createdUser = await prisma.user.create({
      data: {
        email: config.ownerEmail,
        supabaseId: config.ownerSupabaseId,
        firstname: config.ownerFirstname,
        lastname: config.ownerLastname,
        avatar: config.ownerAvatar,
        role: [UserRole.Admin, UserRole.Therapist],
      },
    });

    console.log(`Created owner user ${createdUser.email} (${createdUser.id})`);
    return createdUser;
  }

  if (
    config.ownerSupabaseId &&
    existingUser.supabaseId !== config.ownerSupabaseId
  ) {
    throw new Error(
      `Existing user ${config.ownerEmail} has supabaseId ${existingUser.supabaseId}, which does not match BOOTSTRAP_OWNER_SUPABASE_ID.`,
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      firstname: config.ownerFirstname || existingUser.firstname,
      lastname: config.ownerLastname || existingUser.lastname,
      avatar: config.ownerAvatar ?? existingUser.avatar,
      role: mergeRoles(existingUser.role),
    },
  });

  console.log(`Updated owner user ${updatedUser.email} (${updatedUser.id})`);
  return updatedUser;
}

async function bootstrapCompany(config: BootstrapConfig, ownerUserId: string) {
  const existingCompany = await prisma.company.findUnique({
    where: { slug: config.companySlug },
  });

  const company = existingCompany
    ? await prisma.company.update({
        where: { id: existingCompany.id },
        data: {
          name: config.companyName,
          defaultTimezone: config.companyTimezone,
          publicEmail: config.publicEmail ?? existingCompany.publicEmail,
          publicPhone: config.publicPhone ?? existingCompany.publicPhone,
          publicDescription:
            config.publicDescription ?? existingCompany.publicDescription,
          publicSummary: config.publicSummary ?? existingCompany.publicSummary,
          publicSpecialty:
            config.publicSpecialty ?? existingCompany.publicSpecialty,
          publicTherapistId: ownerUserId,
        },
      })
    : await prisma.company.create({
        data: {
          slug: config.companySlug,
          name: config.companyName,
          defaultTimezone: config.companyTimezone,
          publicEmail: config.publicEmail ?? config.ownerEmail,
          publicPhone: config.publicPhone,
          publicDescription: config.publicDescription,
          publicSummary: config.publicSummary,
          publicSpecialty: config.publicSpecialty,
          publicTherapistId: ownerUserId,
        },
      });

  await prisma.companyMembership.upsert({
    where: {
      companyId_userId: {
        companyId: company.id,
        userId: ownerUserId,
      },
    },
    update: {
      role: CompanyMembershipRole.Owner,
    },
    create: {
      companyId: company.id,
      userId: ownerUserId,
      role: CompanyMembershipRole.Owner,
    },
  });

  console.log(`Bootstrapped company ${company.slug} (${company.id})`);
  return company;
}

export async function main() {
  const config = getBootstrapConfig();
  const owner = await resolveBootstrapOwner(config);
  const company = await bootstrapCompany(config, owner.id);

  console.log(
    `Production bootstrap complete. Company ${company.slug} is linked to ${owner.email} as Owner and public therapist.`,
  );
}

main()
  .catch((error) => {
    console.error("❌ Production bootstrap failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
