import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs/promises";
import { prisma } from "./db";

/**
 * Convert video to WebM (background process).
 * Updates DB when done, falls back to original on failure.
 *
 * Strategy: CRF mode (no bitrate) for consistent quality.
 * On success: update DB → delete original.
 * On failure: update DB to original path → keep original file.
 */
export async function convertToWebM(
  inputPath: string,
  outputPath: string,
  polaroidId: number
): Promise<void> {
  return new Promise((resolve) => {
    ffmpeg(inputPath)
      .videoCodec("libvpx-vp9")
      .audioCodec("libopus")
      .outputOptions(["-crf", "30", "-b:v", "0"]) // CRF mode, ignore bitrate
      .format("webm")
      .on("end", async () => {
        console.log(`[FFMPEG] Convert selesai: ${outputPath}`);
        try {
          // Update DB: ganti videoUrl ke WebM path
          const webmRelative = outputPath.replace(
            path.join(process.cwd(), "public"),
            ""
          );
          await prisma.polaroid.update({
            where: { id: polaroidId },
            data: { videoUrl: webmRelative },
          });
          // Hapus original
          await fs.unlink(inputPath).catch(() => {});
          console.log(`[FFMPEG] Original dihapus: ${inputPath}`);
        } catch (err) {
          console.error("[FFMPEG] Gagal update DB setelah convert:", err);
          // DB still points to original — original file still exists — consistent state
        }
        resolve();
      })
      .on("error", (err: Error) => {
        console.error(`[FFMPEG] Convert gagal, fallback ke original:`, err.message);
        // Fallback: biarkan original file, update DB dengan original path
        // This ensures DB points to an existing file
        const originalRelative = inputPath.replace(
          path.join(process.cwd(), "public"),
          ""
        );
        prisma.polaroid
          .update({
            where: { id: polaroidId },
            data: { videoUrl: originalRelative },
          })
          .then(() => {
            console.log(`[FFMPEG] DB diupdate ke original: ${originalRelative}`);
          })
          .catch((dbErr) => {
            console.error("[FFMPEG] Gagal update DB ke original:", dbErr);
            // Last resort: DB might point to WebM that doesn't exist
            // User will see broken video, but original file is still on disk
          });
        resolve(); // Resolve — user tetap bisa lihat video (original)
      })
      .save(outputPath);
  });
}
