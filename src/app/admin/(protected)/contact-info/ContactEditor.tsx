"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

type Locale = "en" | "zh" | "zh-hk";

interface QrCode {
  label: string;
  imageUrl: string;
}

interface SocialLink {
  platform: string;
  url: string;
}

interface ContactData {
  locale: Locale;
  address1Region: string;
  address1Detail: string;
  address2Region: string;
  address2Detail: string;
  phone: string;
  email: string;
  qrCodes: QrCode[];
  socialLinks: SocialLink[];
}

const LOCALES: { key: Locale; label: string }[] = [
  { key: "en", label: "Contact - EN" },
  { key: "zh", label: "联系方式 - 简中" },
  { key: "zh-hk", label: "聯繫方式 - 繁中" },
];

function emptyContact(locale: Locale): ContactData {
  return {
    locale,
    address1Region: "",
    address1Detail: "",
    address2Region: "",
    address2Detail: "",
    phone: "",
    email: "",
    qrCodes: [],
    socialLinks: [],
  };
}

export default function ContactEditor() {
  const [activeLocale, setActiveLocale] = useState<Locale>("en");
  const [data, setData] = useState<Record<Locale, ContactData>>({
    en: emptyContact("en"),
    zh: emptyContact("zh"),
    "zh-hk": emptyContact("zh-hk"),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [uploadingQr, setUploadingQr] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/contact-info")
      .then((r) => r.json())
      .then(({ contacts }: { contacts: ContactData[] }) => {
        if (!contacts) return;
        setData((prev) => {
          const next = { ...prev };
          for (const c of contacts) next[c.locale] = c;
          return next;
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const current = data[activeLocale];

  const patch = useCallback(
    (p: Partial<ContactData>) => {
      setData((prev) => ({
        ...prev,
        [activeLocale]: { ...prev[activeLocale], ...p },
      }));
    },
    [activeLocale],
  );

  /* ── QR codes ── */
  function addQr() {
    patch({ qrCodes: [...current.qrCodes, { label: "", imageUrl: "" }] });
  }

  function removeQr(idx: number) {
    patch({ qrCodes: current.qrCodes.filter((_, i) => i !== idx) });
  }

  function patchQr(idx: number, p: Partial<QrCode>) {
    patch({
      qrCodes: current.qrCodes.map((q, i) => (i === idx ? { ...q, ...p } : q)),
    });
  }

  async function uploadQrImage(idx: number, file: File) {
    setUploadingQr(idx);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: fd,
      });
      const json = await res.json();
      if (json.ok) patchQr(idx, { imageUrl: json.media.url });
    } finally {
      setUploadingQr(null);
    }
  }

  /* ── Social links ── */
  function addSocial() {
    patch({ socialLinks: [...current.socialLinks, { platform: "", url: "" }] });
  }

  function removeSocial(idx: number) {
    patch({ socialLinks: current.socialLinks.filter((_, i) => i !== idx) });
  }

  function patchSocial(idx: number, p: Partial<SocialLink>) {
    patch({
      socialLinks: current.socialLinks.map((s, i) =>
        i === idx ? { ...s, ...p } : s,
      ),
    });
  }

  /* ── Save ── */
  async function save() {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const res = await fetch("/api/contact-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
      });
      setSaveStatus(res.ok ? "success" : "error");
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Language tabs */}
      <div className="flex gap-1 border-b border-zinc-200">
        {LOCALES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveLocale(key)}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition ${
              activeLocale === key
                ? "bg-white border border-b-white border-zinc-200 -mb-px text-black"
                : "text-zinc-500 hover:text-black"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Address */}
      <Section title="公司地址 / Addresses">
        <div className="space-y-4">
          <AddressRow
            label="地址 1 / Address 1"
            region={current.address1Region}
            detail={current.address1Detail}
            onRegion={(v) => patch({ address1Region: v })}
            onDetail={(v) => patch({ address1Detail: v })}
          />
          <AddressRow
            label="地址 2 / Address 2"
            region={current.address2Region}
            detail={current.address2Detail}
            onRegion={(v) => patch({ address2Region: v })}
            onDetail={(v) => patch({ address2Detail: v })}
          />
        </div>
      </Section>

      {/* Phone & Email */}
      <Section title="联系方式 / Contact Details">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="联系电话 Phone">
            <input
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              value={current.phone}
              onChange={(e) => patch({ phone: e.target.value })}
              placeholder="+852 1234 5678"
              type="tel"
            />
          </Field>
          <Field label="联系邮箱 Email">
            <input
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              value={current.email}
              onChange={(e) => patch({ email: e.target.value })}
              placeholder="hello@example.com"
              type="email"
            />
          </Field>
        </div>
      </Section>

      {/* QR Codes */}
      <Section title="联系二维码 / QR Codes">
        <div className="space-y-4">
          {current.qrCodes.length === 0 && (
            <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-sm text-zinc-400">
              暂无二维码，点击下方按钮添加
            </p>
          )}
          {current.qrCodes.map((qr, idx) => (
            <div key={idx} className="rounded-xl border bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-600">
                  二维码 {idx + 1}
                </span>
                <button
                  onClick={() => removeQr(idx)}
                  className="text-xs text-red-500 hover:text-red-700 transition"
                >
                  删除 / Remove
                </button>
              </div>

              <Field label="标签名 Label（如：WhatsApp、微信）">
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                  value={qr.label}
                  onChange={(e) => patchQr(idx, { label: e.target.value })}
                  placeholder="WhatsApp"
                />
              </Field>

              <Field label="二维码图片 QR Image">
                {qr.imageUrl ? (
                  <div className="flex items-start gap-4">
                    <div className="relative h-28 w-28 overflow-hidden rounded-lg border bg-zinc-100 shrink-0">
                      <Image
                        src={qr.imageUrl}
                        alt={qr.label || "qr code"}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <button
                      onClick={() => patchQr(idx, { imageUrl: "" })}
                      className="text-xs text-red-500 hover:text-red-700 mt-1"
                    >
                      移除图片
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-sm text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition">
                    {uploadingQr === idx ? (
                      <span>上传中…</span>
                    ) : (
                      <>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                        </svg>
                        <span>点击上传二维码图片</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={uploadingQr !== null}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadQrImage(idx, f);
                      }}
                    />
                  </label>
                )}
              </Field>
            </div>
          ))}

          <button
            onClick={addQr}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 py-4 text-sm text-zinc-500 transition hover:border-zinc-400 hover:text-black"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            添加二维码 / Add QR Code
          </button>
        </div>
      </Section>

      {/* Social Links */}
      <Section title="社交媒体 / Social Media">
        <div className="space-y-3">
          {current.socialLinks.length === 0 && (
            <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-sm text-zinc-400">
              暂无社交媒体，点击下方按钮添加
            </p>
          )}
          {current.socialLinks.map((link, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                className="w-36 shrink-0 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                value={link.platform}
                onChange={(e) => patchSocial(idx, { platform: e.target.value })}
                placeholder="LinkedIn"
              />
              <input
                className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
                value={link.url}
                onChange={(e) => patchSocial(idx, { url: e.target.value })}
                placeholder="https://linkedin.com/company/..."
                type="url"
              />
              <button
                onClick={() => removeSocial(idx)}
                className="shrink-0 rounded-md border px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition"
                title="删除"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
          ))}

          <button
            onClick={addSocial}
            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-300 py-3 text-sm text-zinc-500 transition hover:border-zinc-400 hover:text-black"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            添加社交媒体 / Add Social Link
          </button>
        </div>
      </Section>

      {/* Save */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {saving ? "保存中…" : "保存 Save"}
        </button>
        {saveStatus === "success" && (
          <span className="text-sm text-green-600 font-medium">✓ 已保存</span>
        )}
        {saveStatus === "error" && (
          <span className="text-sm text-red-600 font-medium">
            保存失败，请重试
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Shared UI helpers ── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 space-y-4">
      <h2 className="text-base font-semibold text-zinc-700">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-500">{label}</label>
      {children}
    </div>
  );
}

function AddressRow({
  label,
  region,
  detail,
  onRegion,
  onDetail,
}: {
  label: string;
  region: string;
  detail: string;
  onRegion: (v: string) => void;
  onDetail: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-500">{label}</label>
      <div className="flex gap-2">
        <input
          className="w-36 shrink-0 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
          value={region}
          onChange={(e) => onRegion(e.target.value)}
          placeholder="地区 Region"
        />
        <input
          className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
          value={detail}
          onChange={(e) => onDetail(e.target.value)}
          placeholder="具体地址 Detail"
        />
      </div>
    </div>
  );
}
