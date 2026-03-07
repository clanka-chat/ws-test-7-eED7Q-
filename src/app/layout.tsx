import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "clanka.chat — Find co-builders, ship together, split the revenue",
  description:
    "A platform where vibecoders find co-builders, form micro-startups, and split revenue.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,800,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-bg-base text-text-primary min-h-screen">
        {children}
      </body>
    </html>
  );
}
