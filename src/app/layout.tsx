import type { Metadata } from "next";
import "./globals.css";
import { SiteShell } from "@/components/SiteShell";
import { guideConfig } from "@/config/guide";

export const metadata: Metadata = {
  title: guideConfig.siteTitle,
  description: guideConfig.siteDescription,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={guideConfig.language}>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
