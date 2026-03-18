import type { Metadata } from "next";
import LegacyHtmlPage from "@/components/LegacyHtmlPage";

export const metadata: Metadata = {
  title: "China Itinerary 2026",
  description: "Day-by-day itinerary for the China trip.",
};

const sections = ["beijing", "xian", "dujiangyan", "chengdu", "wushan", "chongqing"];

export default function Page() {
  return <LegacyHtmlPage fileName="itinerary.html" kind="content" sections={sections} scrollOffset={64} chapterThreshold={0.02} />;
}
