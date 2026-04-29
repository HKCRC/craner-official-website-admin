import "server-only";

/** Mongo documents may temporarily omit `addresses` before migration. */
export function normalizeContactAddressesJson(raw: unknown): object[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (!item || typeof item !== "object") return { region: "", detail: "" };
    const o = item as Record<string, unknown>;
    return {
      region: String(o.region ?? ""),
      detail: String(o.detail ?? ""),
    };
  });
}
