import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Management", template: "%s · Suez Trading Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
