import { runSongPipeline } from "../src/lib/pipeline";

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  if (i === -1) return undefined;
  return process.argv[i + 1];
}

async function main() {
  const genreId = arg("--genre") || "tpop";
  const theme = arg("--theme") || "คืนฝนในกรุงเทพ";
  const mood = arg("--mood") || "คิดถึง / nostalgic";
  const language = (arg("--lang") || "th") as "th" | "en" | "mixed";
  const vocalGender = (arg("--vocal") || "unspecified") as
    | "male"
    | "female"
    | "unspecified";
  const title = arg("--title");

  const result = await runSongPipeline({
    genreId,
    theme,
    mood,
    language,
    vocalGender,
    title: title || undefined,
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
