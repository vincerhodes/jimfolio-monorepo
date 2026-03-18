import type { Metadata } from "next";
import LegacyHtmlPage from "@/components/LegacyHtmlPage";

export const metadata: Metadata = {
  title: "China 2026 — Mark, Beck & Stan",
  description: "Landing page for the Chinahols trip guide.",
};

export default function Page() {
  return <LegacyHtmlPage fileName="index.html" kind="none" />;
}
