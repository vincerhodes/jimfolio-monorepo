import type { Metadata } from "next";
import LegacyHtmlPage from "@/components/LegacyHtmlPage";

export const metadata: Metadata = {
  title: "China Planning & Packing Guide 2026",
  description: "Planning, weather, and packing guide for Mark, Bec, and Stan.",
};

const sections = ["overview", "weather", "packing", "beijing", "xian", "dujiangyan", "chengdu", "wushan", "chongqing"];

export default function Page() {
  return <LegacyHtmlPage fileName="planning.html" kind="planning" sections={sections} scrollOffset={64} chapterThreshold={0.08} />;
}
