import type { Metadata } from "next";
import "./globals.css";
import "./print.css";
import { SiteShell } from "@/components/SiteShell";
import { AudioProvider } from "@/components/tts/AudioProvider";
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
        <SiteShell>
          <AudioProvider>{children}</AudioProvider>
        </SiteShell>
      </body>
    </html>
  );
}
