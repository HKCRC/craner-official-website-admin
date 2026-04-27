// ─── Block types stored in Product.blocks (JSON) ───────────────────────────

export type BlockType =
  | "text-image"   // 50/50: text left + image right  OR  image left + text right
  | "image-image"  // 50/50: image left + image right
  | "full-image"   // 100% width image
  | "qa";          // Q&A accordion item

// Shared sub-shapes
export interface BlockImage {
  url: string;   // direct URL or uploaded path
  link?: string; // optional href
}

export interface BlockText {
  heading?: string;     // large heading
  subheading?: string;  // small heading
  description?: string; // body text
}

// Individual block variants
export interface TextImageBlock {
  id: string;
  type: "text-image";
  layout: "text-left" | "image-left"; // which side the text is on
  text: BlockText;
  /**
   * Multiple images for carousel use-cases.
   * Backwards compatibility: older data may have `image` instead of `images`.
   */
  images: BlockImage[];
  /** @deprecated use `images` */
  image?: BlockImage;
}

export interface ImageImageBlock {
  id: string;
  type: "image-image";
  left: BlockImage;
  right: BlockImage;
}

export interface FullImageBlock {
  id: string;
  type: "full-image";
  image: BlockImage;
}

export interface QaBlock {
  id: string;
  type: "qa";
  question: string;
  answer: string;
}

export type ProductBlock =
  | TextImageBlock
  | ImageImageBlock
  | FullImageBlock
  | QaBlock;

// Feature list item  e.g. { label: "AI Accuracy", value: "90%" }
export interface FeatureItem {
  label: string;
  value: string;
}
