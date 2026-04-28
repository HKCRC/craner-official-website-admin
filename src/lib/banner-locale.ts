import "server-only";

import type { BannerLocale } from "@prisma/client";

export type PublicBannerLocale = "en" | "zh" | "zh-hk";

export function toDbBannerLocale(locale: PublicBannerLocale): BannerLocale {
  if (locale === "zh-hk") return "zh_hk";
  return locale;
}

export function fromDbBannerLocale(locale: BannerLocale): PublicBannerLocale {
  if (locale === "zh_hk") return "zh-hk";
  return locale;
}

