import { describe, expect, it, vi } from "vitest";
import { shareComic } from "./shareComic";

describe("shareComic", () => {
  const data = { title: "Blue Lock", text: "Đọc Blue Lock", url: "https://example.com/comic" };

  it("uses the native share sheet when the browser supports it", async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    await expect(shareComic(data, { share } as unknown as Navigator)).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith(data);
  });

  it("copies the URL when a native share sheet is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    await expect(shareComic(data, { clipboard: { writeText } } as unknown as Navigator)).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith(data.url);
  });
});
