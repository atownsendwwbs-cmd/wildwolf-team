import "server-only";

type Lang = "EN" | "ES";

const LANGPAIR: Record<Lang, string> = { EN: "en", ES: "es" };

// MyMemory's free anonymous tier caps a single query around ~500 bytes,
// so longer briefs need to be split into chunks and translated piecewise.
const MAX_CHUNK_LENGTH = 400;

function chunkText(text: string): string[] {
  const lines = text.split("\n");
  const chunks: string[] = [];

  for (const line of lines) {
    if (line.length <= MAX_CHUNK_LENGTH) {
      chunks.push(line);
      continue;
    }
    let remaining = line;
    while (remaining.length > MAX_CHUNK_LENGTH) {
      let cut = remaining.lastIndexOf(" ", MAX_CHUNK_LENGTH);
      if (cut <= 0) cut = MAX_CHUNK_LENGTH;
      chunks.push(remaining.slice(0, cut));
      remaining = remaining.slice(cut).trimStart();
    }
    chunks.push(remaining);
  }

  return chunks;
}

async function translateChunk(text: string, from: Lang, to: Lang): Promise<string | null> {
  if (!text.trim()) return "";

  try {
    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", text);
    url.searchParams.set("langpair", `${LANGPAIR[from]}|${LANGPAIR[to]}`);

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;

    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (typeof translated !== "string") return null;

    return translated;
  } catch {
    return null;
  }
}

// Best-effort machine translation via MyMemory's free public API (no key
// required). Returns null on any failure so callers can fall back to
// showing the original text instead of blocking on a translation service.
export async function translateText(text: string, from: Lang, to: Lang): Promise<string | null> {
  if (!text.trim()) return "";
  if (from === to) return text;

  const lines = text.split("\n");
  const translatedLines: string[] = [];

  for (const line of lines) {
    if (!line.trim()) {
      translatedLines.push(line);
      continue;
    }

    const chunks = chunkText(line).filter((c) => c === "" || c.trim());
    const translatedChunks: string[] = [];

    for (const chunk of chunks) {
      const result = await translateChunk(chunk, from, to);
      if (result === null) return null;
      translatedChunks.push(result);
    }

    translatedLines.push(translatedChunks.join(" "));
  }

  return translatedLines.join("\n");
}
