"use client";

import { useActionState, useMemo, useState } from "react";

export type ConfigRow = { id: string; key: string; val: string };

type SaveState = { ok: true; message?: string } | { ok: false; error: string } | null;

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function ConfigForm({
  initialRows,
  saveAction,
}: {
  initialRows: Omit<ConfigRow, "id">[];
  saveAction: (prev: SaveState, formData: FormData) => Promise<SaveState>;
}) {
  const [state, formAction, pending] = useActionState(saveAction, null);
  const [rows, setRows] = useState<ConfigRow[]>(() =>
    initialRows.length > 0
      ? initialRows.map((r) => ({ id: uid(), key: r.key, val: r.val }))
      : [{ id: uid(), key: "", val: "" }],
  );

  const payload = useMemo(
    () => JSON.stringify(rows.map(({ key, val }) => ({ key, val }))),
    [rows],
  );

  function addRow() {
    setRows((prev) => [...prev, { id: uid(), key: "", val: "" }]);
  }

  function removeRow(index: number) {
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [{ id: uid(), key: "", val: "" }];
    });
  }

  function updateRow(index: number, patch: Partial<Pick<ConfigRow, "key" | "val">>) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="payload" value={payload} readOnly />

      {state && !state.ok ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      ) : null}
      {state && state.ok ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {state.message ?? "已保存"}
        </div>
      ) : null}

      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 border-b bg-zinc-50 px-4 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">
          <span>Key（英文）</span>
          <span>配置值</span>
          <span className="text-right pr-2"> </span>
        </div>
        <div className="divide-y">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="grid grid-cols-1 gap-2 px-4 py-3 md:grid-cols-[1fr_1fr_auto] md:items-center"
            >
              <input
                name={`k-${index}`}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                placeholder="e.g. site_title"
                value={row.key}
                onChange={(e) => updateRow(index, { key: e.target.value })}
                spellCheck={false}
                autoComplete="off"
              />
              <input
                name={`v-${index}`}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                placeholder="配置值"
                value={row.val}
                onChange={(e) => updateRow(index, { val: e.target.value })}
              />
              <div className="flex justify-end md:justify-center">
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800 hover:bg-red-100"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addRow}
          className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          + 增加配置
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "保存中…" : "保存（全量同步）"}
        </button>
      </div>

      <p className="text-xs text-zinc-500">
        Key 必须以英文字母开头，只能包含字母、数字、下划线和中划线。保存时会与数据库全量对齐：新增会插入、删除会从库中移除、修改会更新
        val。
      </p>
    </form>
  );
}
