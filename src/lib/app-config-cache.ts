import "server-only";

import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";

export const APP_CONFIG_CACHE_TAG = "app-kv-config";

export async function getAppConfigRowsCached() {
  return unstable_cache(
    async () =>
      prisma.appConfig.findMany({
        orderBy: { key: "asc" },
        select: { id: true, key: true, val: true, updatedAt: true },
      }),
    ["app-config-rows"],
    { tags: [APP_CONFIG_CACHE_TAG] },
  )();
}

export function revalidateAppConfigCache() {
  revalidateTag(APP_CONFIG_CACHE_TAG, "max");
}
