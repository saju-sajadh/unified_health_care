import { Poppins } from "next/font/google";
import "./globals.css";

import ScrollToTop from "@/components/ScrollToTop";
const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${font.className}`}>
          {children}
          <ScrollToTop />
        </body>
      </html>
    </ClerkProvider>
  );
}
