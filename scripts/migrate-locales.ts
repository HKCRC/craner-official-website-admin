import { PrismaClient } from "@prisma/client";

/**
 * One-off migration after changing BannerLocale enum values:
 * - EN -> en
 * - ZH -> zh
 * - ZH-HK -> zh_hk
 * - ZH_HANS -> zh
 * - ZH_HANT -> zh_hk
 *
 * This updates both HomepageBanner.locale and ContactInfo.locale (MongoDB).
 */
async function main() {
  const prisma = new PrismaClient();

  const mappings: Array<{ from: string; to: string }> = [
    { from: "EN", to: "en" },
    { from: "ZH", to: "zh" },
    { from: "ZH-HK", to: "zh_hk" },
    { from: "ZH_HANS", to: "zh" },
    { from: "ZH_HANT", to: "zh_hk" },
  ];

  for (const { from, to } of mappings) {
    // homepage banners
    await prisma.$runCommandRaw({
      update: "HomepageBanner",
      updates: [
        {
          q: { locale: from },
          u: { $set: { locale: to } },
          multi: true,
        },
      ],
    });

    // contact infos
    await prisma.$runCommandRaw({
      update: "ContactInfo",
      updates: [
        {
          q: { locale: from },
          u: { $set: { locale: to } },
          multi: true,
        },
      ],
    });
  }

  await prisma.$disconnect();
  // eslint-disable-next-line no-console
  console.log("Locale migration complete.");
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});

