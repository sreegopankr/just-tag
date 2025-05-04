const STORAGE_KEY = 'bookmarks';

const StorageService = {
  getBookmarks: () => {
    if (typeof window === 'undefined') return [];
    const bookmarks = localStorage.getItem(STORAGE_KEY);
    return bookmarks ? JSON.parse(bookmarks) : [];
  },

  saveBookmarks: (bookmarks: any[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  },

  addBookmark: (bookmark: any) => {
    const bookmarks = StorageService.getBookmarks();
    bookmarks.unshift(bookmark);
    StorageService.saveBookmarks(bookmarks);
    return bookmarks;
  },

  deleteBookmark: (id: string | number) => {
    const bookmarks = StorageService.getBookmarks();
    const updatedBookmarks = bookmarks.filter((bookmark: any) => bookmark.id.toString() !== id.toString());
    StorageService.saveBookmarks(updatedBookmarks);
    return updatedBookmarks;
  },

  updateBookmark: (updatedBookmark: any) => {
    const bookmarks = StorageService.getBookmarks();
    const updatedBookmarks = bookmarks.map((bookmark: any) =>
      bookmark.id.toString() === updatedBookmark.id.toString() ? updatedBookmark : bookmark
    );
    StorageService.saveBookmarks(updatedBookmarks);
    return updatedBookmarks;
  }
};

export default StorageService;