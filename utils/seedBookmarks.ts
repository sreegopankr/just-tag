import dummyData from "./dummyData.json";
import StorageService from "../services/StorageService";

export function seedBookmarksIfEmpty() {
  if (typeof window !== "undefined") {
    const existing = StorageService.getBookmarks();
    if (!existing || existing.length === 0) {
      StorageService.saveBookmarks(dummyData);
    }
  }
}