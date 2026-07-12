async function main() {
  if (process.env.RUN_PAGES_INDEX_MIGRATION !== "1") {
    return;
  }

  if (process.env.VERCEL_ENV !== "production" || !process.env.MONGO_URI) {
    throw new Error("Page index migration requires Vercel production with MONGO_URI configured.");
  }

  const { ensurePagesIndex } = await import("./ensure-pages-index");
  await ensurePagesIndex();
}

main().catch((error) => {
  console.error("Page index migration was not run:", error);
  process.exitCode = 1;
});
