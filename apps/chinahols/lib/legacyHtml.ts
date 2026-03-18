import fs from "node:fs/promises";
import path from "node:path";

const BASE_PATH = "/chinahols";

const linkMap: Record<string, string> = {
  "index.html": `${BASE_PATH}`,
  "itinerary.html": `${BASE_PATH}/itinerary`,
  "study.html": `${BASE_PATH}/study`,
  "planning.html": `${BASE_PATH}/planning`,
  "index-archive.html": `${BASE_PATH}/archive`,
};

export type LegacyPageData = {
  bodyClass: string;
  content: string;
  title: string;
};

function transformMarkup(markup: string) {
  return markup
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/\s+onclick="goTo\('([^']+)'\)"/g, ' data-go-to="$1"')
    .replace(/\shref="(index\.html|itinerary\.html|study\.html|planning\.html|index-archive\.html)"/g, (_, href: string) => ` href="${linkMap[href]}"`)
    .replace(/\ssrc="images\/([^"]+)"/g, ` src="${BASE_PATH}/images/$1"`)
    .replace(/\shref="originalpdfs\/([^"]+)"/g, ` href="${BASE_PATH}/originalpdfs/$1"`);
}

export async function loadLegacyPage(fileName: string): Promise<LegacyPageData> {
  const filePath = path.join(process.cwd(), fileName);
  const html = await fs.readFile(filePath, "utf8");
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const bodyMatch = html.match(/<body([^>]*)>([\s\S]*?)<\/body>/i);
  const classMatch = bodyMatch?.[1]?.match(/class="([^"]+)"/i);

  return {
    bodyClass: classMatch?.[1] ?? "",
    content: transformMarkup(bodyMatch?.[2] ?? html),
    title: titleMatch?.[1]?.trim() ?? "Chinahols",
  };
}
