import type { CompactPrompt } from "./load";

export async function inflateGzipBase64(b64: string): Promise<CompactPrompt[]> {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  const text = await new Response(stream).text();
  const parsed: unknown = JSON.parse(text);
  if (!Array.isArray(parsed) || parsed.length === 0 || !Array.isArray(parsed[0])) {
    throw new Error("banque gzip invalide");
  }
  return parsed as CompactPrompt[];
}
