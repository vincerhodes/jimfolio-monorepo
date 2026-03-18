import type { Metadata } from "next";
import LegacyHtmlPage from "@/components/LegacyHtmlPage";

export const metadata: Metadata = {
  title: "China Study 2026",
  description: "Stories behind the journey through China.",
};

const sections = ["ch1", "ch2", "ch3", "ch4", "ch5", "ch6", "ch7", "ch8"];

export default function Page() {
  return <LegacyHtmlPage fileName="study.html" kind="content" sections={sections} scrollOffset={110} chapterThreshold={0.08} />;
}
