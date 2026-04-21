"use client";

import dynamic from "next/dynamic";

const RichEditorInner = dynamic(() => import("./RichEditorInner"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border bg-white p-6 text-sm text-zinc-500">
      Loading editor...
    </div>
  ),
});

type MediaItem = { id: string; url: string; originalName: string };

type Props = {
  name: string;
  initialHtml?: string;
  media?: MediaItem[];
};

export function RichEditorField(props: Props) {
  return <RichEditorInner {...props} />;
}
