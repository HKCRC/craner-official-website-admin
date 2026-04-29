import { PrismaClient } from "@prisma/client";

/**
 * After Prisma removes the legacy address string fields from the schema,
 * MongoDB may still contain those keys on old documents.
 *
 * This script reads raw `ContactInfo` docs, builds `addresses` from legacy
 * fields when needed, then `$unset`s legacy keys. Safe to re-run.
 */
async function main() {
  const prisma = new PrismaClient();

  const res = await prisma.$runCommandRaw({
    find: "ContactInfo",
    filter: {},
    batchSize: 100,
  });

  const batch = res.cursor?.firstBatch ?? res.firstBatch;
  if (!Array.isArray(batch)) {
    console.error("Unexpected find response:", JSON.stringify(res));
    await prisma.$disconnect();
    process.exit(1);
  }

  for (const doc of batch) {
    const id = doc._id;
    const hasLegacy =
      doc.address1Region != null ||
      doc.address1Detail != null ||
      doc.address2Region != null ||
      doc.address2Detail != null;

    const fromLegacy = [];
    if (hasLegacy) {
      fromLegacy.push({
        region: String(doc.address1Region ?? ""),
        detail: String(doc.address1Detail ?? ""),
      });
      fromLegacy.push({
        region: String(doc.address2Region ?? ""),
        detail: String(doc.address2Detail ?? ""),
      });
    }

    const existing = Array.isArray(doc.addresses) ? doc.addresses : [];
    const addresses =
      existing.length > 0
        ? existing.map((row) => ({
            region: String(row?.region ?? ""),
            detail: String(row?.detail ?? ""),
          }))
        : fromLegacy.filter((a) => a.region.trim() || a.detail.trim());

    const updateDoc =
      hasLegacy || existing.length > 0
        ? {
            $set: { addresses },
            ...(hasLegacy
              ? {
                  $unset: {
                    address1Region: "",
                    address1Detail: "",
                    address2Region: "",
                    address2Detail: "",
                  },
                }
              : {}),
          }
        : null;

    if (updateDoc) {
      await prisma.$runCommandRaw({
        update: "ContactInfo",
        updates: [{ q: { _id: id }, u: updateDoc }],
      });
    }
  }

  await prisma.$disconnect();
  console.log(`Migrated ${batch.length} ContactInfo document(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
