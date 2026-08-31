import type { Metadata } from "next";
import "./globals.css";
import "filepond/dist/filepond.min.css";
import { ThemeProvider } from "@/lib/theme";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { Toaster } from "sonner";
import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Durrat Construction - Oil & Gas Construction Specialists",
  description: "Leading oil & gas construction contractor specializing in offshore platforms, pipelines, processing facilities, and EPC projects.",
  ...(siteUrl
    ? {
        metadataBase: siteUrl,
        alternates: { canonical: "/" },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <SmoothScrollProvider>
            {children}
            <Toaster
              richColors
              closeButton
              position="top-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: "#181818",
                  borderColor: "#2f2f2f",
                  color: "#f5f5f5",
                },
              }}
            />
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
