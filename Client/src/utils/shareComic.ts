export interface ComicShareData {
  title: string;
  text: string;
  url: string;
}

export type ShareResult = "shared" | "copied" | "unavailable";

export async function shareComic(data: ComicShareData, target: Navigator = navigator): Promise<ShareResult> {
  if (typeof target.share === "function") {
    await target.share(data);
    return "shared";
  }

  if (typeof target.clipboard?.writeText === "function") {
    await target.clipboard.writeText(data.url);
    return "copied";
  }

  return "unavailable";
}
