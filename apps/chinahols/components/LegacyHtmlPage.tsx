import LegacyPageClient from "@/components/LegacyPageClient";
import { loadLegacyPage } from "@/lib/legacyHtml";

type Props = {
  fileName: string;
  kind: "none" | "archive" | "content" | "planning";
  sections?: string[];
  scrollOffset?: number;
  chapterThreshold?: number;
};

export default async function LegacyHtmlPage({
  fileName,
  kind,
  sections,
  scrollOffset,
  chapterThreshold,
}: Props) {
  const page = await loadLegacyPage(fileName);

  return (
    <div className={page.bodyClass || undefined}>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
      <LegacyPageClient
        kind={kind}
        sections={sections}
        scrollOffset={scrollOffset}
        chapterThreshold={chapterThreshold}
      />
    </div>
  );
}
