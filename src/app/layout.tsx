import type { Metadata } from "next";
import "@/shared/styles/global.css";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
  title: "Sysboard",
  description: "Collaborative diagramming for software architects",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
