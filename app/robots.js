// app/robots.js  – Next.js App Router Metadata Route
// This generates /robots.txt automatically.

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: "https://sahiseat.vercel.app/sitemap.xml",
    host: "https://sahiseat.vercel.app",
  };
}
