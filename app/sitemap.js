// app/sitemap.js  – Next.js App Router Metadata Route
// This generates /sitemap.xml automatically.

export default function sitemap() {
  const baseUrl = "https://sahiseat.vercel.app";
  const now = new Date().toISOString();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
