import type { Metadata } from "next";
import LegacyHtmlPage from "@/components/LegacyHtmlPage";

export const metadata: Metadata = {
  title: "Mark, Bec & Stan's China Adventure – Choose Your Route",
  description: "Original route comparison archive for the China adventure.",
};

export default function Page() {
  return <LegacyHtmlPage fileName="index-archive.html" kind="archive" />;
}
