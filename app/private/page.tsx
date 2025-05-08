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
import { useRef } from "react";

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
  const [editGroupModal, setEditGroupModal] = useState<{open: boolean, group: string}>({open: false, group: ''});
  const [deleteGroupModal, setDeleteGroupModal] = useState<{open: boolean, group: string}>({open: false, group: ''});
  const [newGroupName, setNewGroupName] = useState('');

  function handleDeleteGroup(group: string) {
    const updated = StorageService.getBookmarks().filter((bm: Bookmark) => bm.group !== group);
    StorageService.saveBookmarks(updated);
    setBookmarks(updated);
    setDeleteGroupModal({open: false, group: ''});
  }

  function handleEditGroupSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editGroupModal.group || !newGroupName.trim()) return;
    const updated = StorageService.getBookmarks().map((bm: Bookmark) => bm.group === editGroupModal.group ? {...bm, group: newGroupName.trim()} : bm);
    StorageService.saveBookmarks(updated);
    setBookmarks(updated);
    setEditGroupModal({open: false, group: ''});
    setNewGroupName('');
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20 text-black">
      <header className="py-6 text-center fixed top-0 left-0 right-0 font-bold text-lg bg-white shadow-sm mb-2 text-black">
        Private Collections
      </header>
      <main className="px-4 pt-20">
        {collections.map((col) => (
          <div
            key={col.group}
            onClick={e => {
              // Prevent modal button clicks from triggering navigation
              if ((e.target as HTMLElement).closest('button')) return;
              router.push(`/private/${encodeURIComponent(col.group)}`);
            }}
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
            <button
              className="bg-gray-100 hover:bg-gray-200 rounded-md p-2 shadow-sm mr-2"
              onClick={e => { e.stopPropagation(); setEditGroupModal({open: true, group: col.group}); setNewGroupName(col.group); }}
            >
              <FaEdit className="text-xl text-gray-600" />
            </button>
            <button
              className="bg-gray-100 hover:bg-gray-200 rounded-md p-2 shadow-sm"
              onClick={e => { e.stopPropagation(); setDeleteGroupModal({open: true, group: col.group}); }}
            >
              <MdDelete className="text-xl text-gray-600" />
            </button>
          </div>
        ))}
      </main>
      {/* Edit Group Modal */}
      {editGroupModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form className="bg-white rounded-xl shadow-lg p-6 w-80" onSubmit={handleEditGroupSubmit}>
            <div className="font-semibold mb-4">Edit Group Name</div>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-4"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              autoFocus
            />
            <div className="flex gap-4 mt-2">
              <button type="submit" className="flex-1 bg-[color:var(--primary)] text-white rounded-2xl py-2 font-semibold">Save</button>
              <button type="button" className="flex-1 bg-gray-800 text-white rounded-2xl py-2 font-semibold" onClick={() => setEditGroupModal({open: false, group: ''})}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {/* Delete Group Modal */}
      {deleteGroupModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80">
            <div className="font-semibold mb-4">Delete group "{deleteGroupModal.group}" and all its bookmarks?</div>
            <div className="flex gap-4 mt-2">
              <button className="flex-1 bg-[color:var(--primary)] text-white rounded-2xl py-2 font-semibold" onClick={() => handleDeleteGroup(deleteGroupModal.group)}>Delete</button>
              <button className="flex-1 bg-gray-800 text-white rounded-2xl py-2 font-semibold" onClick={() => setDeleteGroupModal({open: false, group: ''})}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <BottomNavbar />
    </div>
  );
}