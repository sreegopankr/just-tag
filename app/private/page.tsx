"use client";
import React, { useEffect, useState } from "react";
import { FaEdit, FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import dummyData from "../../utils/dummyData.json";
import type { Bookmark } from "../../types/bookmark";
import BottomNavbar from "@/components/BottomNavbar";
import { useRouter } from "next/navigation";
import { seedBookmarksIfEmpty } from "@/utils/seedBookmarks";
import StorageService from "@/services/StorageService";
import { MdDelete } from "react-icons/md";

interface GroupedCollection {
  group: string;
  image: string;
  count: number;
}

function groupBookmarks(bookmarks: Bookmark[]): GroupedCollection[] {
  const groupMap: Record<string, { image: string; count: number }> = {};
  bookmarks.forEach((bm) => {
    if (!groupMap[bm.group]) {
      groupMap[bm.group] = { image: bm.image, count: 1 };
    } else {
      groupMap[bm.group].count++;
    }
  });
  // Unsorted group: bookmarks with empty or missing group
  const unsorted = bookmarks.filter((bm) => !bm.group || bm.group === "Unsorted");
  const result: GroupedCollection[] = [];
  if (unsorted.length > 0) {
    result.push({ group: "Unsorted", image: unsorted[0].image, count: unsorted.length });
  }
  Object.entries(groupMap).forEach(([group, { image, count }]) => {
    if (group !== "Unsorted") {
      result.push({ group, image, count });
    }
  });
  return result;
}

export default function PrivateCollectionsPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const collections = groupBookmarks(bookmarks);
  const router = useRouter();
  useEffect(() => {
    seedBookmarksIfEmpty();
    setBookmarks(StorageService.getBookmarks());
  }, []);
  return (
    <div className="min-h-screen bg-gray-100 pb-20 text-black">
      <header className="py-6 text-center fixed top-0 left-0 right-0 font-bold text-lg bg-white shadow-sm mb-2 text-black">
        Private Collections
      </header>
      <main className="px-4 pt-20">
        {collections.map((col) => (
          <div
            key={col.group}
            onClick={() => router.push(`/private/${encodeURIComponent(col.group)}`)}
            className="flex items-center bg-white rounded-xl shadow-sm mb-4 p-4 gap-4"
          >
            <img
              src={col.image}
              alt={col.group}
              className="w-14 h-14 rounded-lg object-cover border"
            />
            <div className="flex-1">
              <div className="font-semibold text-base">{col.group}</div>
              <div className="text-gray-500 text-sm">{col.count} bookmarks</div>
            </div>
            <button className="bg-gray-100 hover:bg-gray-200 rounded-md p-2 shadow-sm mr-2">
              <FaEdit className="text-xl text-gray-600" />
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 rounded-md p-2 shadow-sm">
              <MdDelete className="text-xl text-gray-600" />
            </button>
          </div>
        ))}
      </main>
      <BottomNavbar />
    </div>
  );
}