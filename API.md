# Public API 文档（给前端）

> 说明：本文档整理的是“前端可直接调用”的公开读取接口（无需登录）。  
> 管理后台编辑/保存使用的接口（需要登录鉴权）不包含在内。

## 通用约定

- **Base**：同域名下的 Next.js App Router API（例如 `/api/...`）
- **时间字段**：均为 ISO 字符串（由 `Date` 序列化）
- **分页参数**：
  - `page`：默认 `1`，范围 `1 ~ 10000`
  - `pageSize`：默认 `20`，范围 `5 ~ 100`
- **分页返回**：
  - `page`, `pageSize`, `total`, `totalPages`, `items`

---

## Posts（文章）

### 1) 获取文章列表（分页，仅已发布）

- **GET** ` /api/posts?page=1&pageSize=20 `
- **Query**
  - `page`：可选
  - `pageSize`：可选
- **Response**
  - `items[]` 字段包含：
    - `id`, `title`, `slug`, `excerpt`, `client`, `tags[]`
    - `publishedAt`, `updatedAt`
    - `coverImageUrl`（可能为 `null`）
    - `categories[]: { name, slug }`

### 2) 获取文章详情（按 slug，仅已发布）

- **GET** ` /api/posts/:slug `
- **Response**
  - `ok: true` 时返回文章详情（包含 `content`）
  - 找不到返回 `404`：`{ ok: false, error: "Not found" }`

### 3) 按分类获取文章列表（分页，仅已发布）

- **GET** ` /api/posts/by-category/:categorySlug?page=1&pageSize=20 `
- **Response**
  - `category: { id, name, slug, title, subtitle, description }`
  - 其余分页字段与 `/api/posts` 一致（`items[]` 同结构）

---

## Products（产品）

### 1) 获取产品列表（分页，仅已发布）

- **GET** ` /api/products?page=1&pageSize=20 `
- **Response**
  - `items[]` 字段包含：
    - `id`, `title`, `subtitle`, `slug`, `tags[]`
    - `publishedAt`, `updatedAt`
    - `coverImageUrl`（可能为 `null`）
    - `categories[]: { name, slug }`

### 2) 获取产品详情（按 slug，仅已发布）

- **GET** ` /api/products/:slug `
- **Response**
  - `ok: true` 时返回产品详情（包含 `featureList`, `blocks`）
  - 找不到返回 `404`：`{ ok: false, error: "Not found" }`

---

## Homepage Banner（首页 Banner，多语言）

> 说明：管理端保存接口是 `/api/homepage-banner`（需登录）；前端读取请用本公开接口。

### 1) 获取全部语言 Banner

- **GET** ` /api/public/homepage-banner `
- **Response**
  - `{ ok: true, banners: HomepageBanner[] }`

### 2) 获取单语言 Banner

- **GET** ` /api/public/homepage-banner?locale=EN|ZH|ZH-HK `
- **Response**
  - `{ ok: true, banner: HomepageBanner }`
  - 找不到返回 `404`：`{ ok: false, error: "Not found" }`

**HomepageBanner 数据结构（核心字段）**

- `locale`: `"EN" | "ZH" | "ZH-HK"`
- `template`: `"CAROUSEL" | "VIDEO"`
- `content`：
  - `CAROUSEL`：`{ slides: Array<{ title: string; subtitle: string; imageUrl: string }> }`
  - `VIDEO`：`{ title: string; subtitle: string; videoUrl: string }`

---

## Contact Info（联系方式，多语言）

> 说明：管理端保存接口是 `/api/contact-info`（需登录）；前端读取请用本公开接口。

### 1) 获取全部语言 Contact Info

- **GET** ` /api/public/contact-info `
- **Response**
  - `{ ok: true, contacts: ContactInfo[] }`

### 2) 获取单语言 Contact Info

- **GET** ` /api/public/contact-info?locale=EN|ZH|ZH-HK `
- **Response**
  - `{ ok: true, contact: ContactInfo }`
  - 找不到返回 `404`：`{ ok: false, error: "Not found" }`

**ContactInfo 数据结构（核心字段）**

- `locale`: `"EN" | "ZH" | "ZH-HK"`
- `address1Region`, `address1Detail`
- `address2Region`, `address2Detail`
- `phone`, `email`
- `qrCodes`: `Array<{ label: string; imageUrl: string }>`
- `socialLinks`: `Array<{ platform: string; url: string }>`

---

## Featured Products（精选产品）

> 说明：管理端 CRUD 是 `/api/featured-products`（需登录）；前端读取用公开接口。

### 获取精选产品列表（按 order 升序）

- **GET** ` /api/public/featured-products `
- **Query**
  - `take`：可选，范围 `1 ~ 500`，默认 `100`
- **Response**
  - `{ ok: true, items: FeaturedProduct[] }`

**FeaturedProduct 数据结构（核心字段）**

- `order: number`
- `title`, `subtitle`, `description`
- `productName`
- `tags: string[]`
- `media`：
  - `{ type: "carousel", images: string[] }`
  - `{ type: "video", url: string }`

---

## 示例请求（可直接复制）

```bash
# posts list
curl "/api/posts?page=1&pageSize=20"

# post detail
curl "/api/posts/some-post-slug"

# posts by category
curl "/api/posts/by-category/case-studies?page=1&pageSize=10"

# products list
curl "/api/products?page=1&pageSize=20"

# product detail
curl "/api/products/some-product-slug"

# homepage banner (all locales)
curl "/api/public/homepage-banner"

# homepage banner (single locale)
curl "/api/public/homepage-banner?locale=ZH_HANS"

# contact info (all locales)
curl "/api/public/contact-info"

# featured products
curl "/api/public/featured-products?take=8"
```

