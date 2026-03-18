import type { Metadata } from "next";
import LegacyHtmlPage from "@/components/LegacyHtmlPage";

export const metadata: Metadata = {
  title: "China 2026 — Mark, Bec & Stan",
  description: "Landing page for the Chinahols trip guide.",
};

export default function Page() {
  return <LegacyHtmlPage fileName="index.html" kind="none" />;
}
