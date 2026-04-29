import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Standalone + Docker 下，运行时写入 public/uploads 的文件不一定能被默认静态层命中；
  // beforeFiles 先于静态文件匹配，交给 /api/uploads 从磁盘流式返回。
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/uploads/:path*", destination: "/api/uploads/:path*" },
      ],
    };
  },
};

export default nextConfig;
