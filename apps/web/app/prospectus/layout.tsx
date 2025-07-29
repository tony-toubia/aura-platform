// apps/web/app/prospectus/layout.tsx
// Optional: Create a dedicated layout for the prospectus page with black background

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sentient Systems - Investment Opportunity",
  description: "Transform any device, system, or data stream into an intelligent entity with personality",
  robots: "noindex, nofollow", // Prevent search engine indexing
};

export default function ProspectusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sentient-layout">
      {children}
    </div>
  );
}