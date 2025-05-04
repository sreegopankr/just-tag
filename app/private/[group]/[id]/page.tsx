'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import StorageService from '@/services/StorageService';
import { Bookmark } from '@/types/bookmark';
import { FaRegEdit, FaRegTrashAlt, FaArrowLeft, FaExpand, FaEdit, FaEye } from 'react-icons/fa';
import BottomNavbar from '@/components/BottomNavbar';
import { MdArrowOutward, MdDelete, MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowRight, MdClose } from 'react-icons/md';
import { FiArrowLeft } from 'react-icons/fi';

export default function BookmarkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupName = decodeURIComponent(params.group as string);
  const bookmarkId = params.id as string;
  const [bookmark, setBookmark] = useState<Bookmark | null>(null);
  const [showTags, setShowTags] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  // Edit form state
  const [editGroup, setEditGroup] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [groups, setGroups] = useState<string[]>([]);

  

  useEffect(() => {
    const allBookmarks = StorageService.getBookmarks();
    const found = allBookmarks.find((b: Bookmark) => b.id === bookmarkId);
    setBookmark(found || null);
    setGroups(Array.from(new Set(allBookmarks.map((b: Bookmark) => b.group || 'Unsorted'))));
    if (found) {
      setEditGroup(found.group);
      setEditTags(found.tags);
      setEditUrl(found.url);
    }
  }, [bookmarkId, editOpen]);

  if (!bookmark) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Bookmark not found.</div>;
  }

  function handleEditTagInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === ' ' || e.key === 'Enter') && editTagInput.trim()) {
      const newTag = editTagInput.trim().replace(/^#/, '');
      if (newTag && !editTags.includes(newTag)) {
        setEditTags([...editTags, newTag]);
      }
      setEditTagInput('');
      e.preventDefault();
    }
  }
  function handleRemoveEditTag(tag: string) {
    setEditTags(editTags.filter(t => t !== tag));
  }
  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookmark) return;
    const allBookmarks = StorageService.getBookmarks();
    const updated = allBookmarks.map((b: Bookmark) => b.id === bookmark.id ? { ...b, group: editGroup, tags: editTags, url: editUrl } : b);
    StorageService.saveBookmarks(updated);
    setBookmark({ ...bookmark, group: editGroup, tags: editTags, url: editUrl });
    setEditOpen(false);
  }
  function handleDelete() {
    if (!bookmark) return;
    const allBookmarks = StorageService.getBookmarks();
    StorageService.saveBookmarks(allBookmarks.filter((b: Bookmark) => b.id !== bookmark.id));
    setDeleteModal(false);
    router.back();
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pb-18 text-black">
      <div className="flex items-center justify-between px-4 pt-6 pb-4">
        <button onClick={() => router.back()} className="p-2"><FiArrowLeft className="text-xl" /></button>
        <span className="font-semibold text-lg">&nbsp;</span>
        <button
            onClick={() => window.open(bookmark.url, '_blank', 'noopener,noreferrer')} 
          className="py-1 px-2 rounded-xl text-white bg-[color:var(--primary)]  flex gap-2 justify-center items-center">Open URL<MdArrowOutward className='text-lg' /></button>
      </div>
      <div className="flex justify-center items-center px-4">
        <img src={bookmark.image} alt={bookmark.title} className="w-full max-w-md border-[1px] border-gray-200 h-48 rounded-xl object-contain" />
      </div>
      <div className="flex justify-end gap-2 px-6 mt-2">
        <button className="bg-gray-100 hover:bg-gray-200 rounded-md p-2 shadow-md" onClick={() => setEditOpen(true)}><FaEdit className="text-xl text-gray-600" /></button>
        <button className="bg-gray-100 hover:bg-gray-200 rounded-md p-2 shadow-md" onClick={() => setDeleteModal(true)}><MdDelete className="text-xl text-gray-600"/></button>
      </div>
      <div className="px-6 mt-4">
        <div className="font-semibold text-lg mb-1">{bookmark.title}</div>
        <div className="text-gray-500 text-sm mb-4">{bookmark.source}</div>
        <div className="border-t border-gray-200">
          <button className="w-full flex justify-between items-center py-3" onClick={() => setShowDescription(v => !v)}>
            <span className="font-medium">Description</span>
            <span className="text-gray-400">{showDescription ? <MdOutlineKeyboardArrowDown className="text-xl" /> : <MdOutlineKeyboardArrowRight className="text-xl" />}</span>
          </button>
          {showDescription && (
            <div className="pb-3 text-gray-700 text-sm">{bookmark.description || 'No description.'}</div>
          )}
        </div>
        <div className="border-t border-gray-200">
          <button className="w-full flex justify-between items-center py-3" onClick={() => setShowTags(v => !v)}>
            <span className="font-medium">Tags</span>
            <span className="text-gray-400">{showTags ?<MdOutlineKeyboardArrowDown className="text-xl" /> : <MdOutlineKeyboardArrowRight className="text-xl" />}</span>
          </button>
          {showTags && (
            <div className="flex flex-wrap gap-2 pb-3">
              {bookmark.tags.map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <button className="w-full mt-2 bg-[color:var(--primary)] text-white rounded-2xl py-3.5 font-semibold text-base active:bg-[color:var(--primary-dark)]  transition">Share</button>
      </div>
      {/* Edit Drawer */}
      {editOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex flex-col">
          <div className="flex-1" onClick={() => setEditOpen(false)}></div>
          <div className="bg-white h-full rounded-t-2xl shadow-lg p-6 w-full max-w-md mx-auto animate-slideUp fixed bottom-0 left-1/2 -translate-x-1/2">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setEditOpen(false)}><MdClose className="text-2xl text-gray-600" /></button>
              <span className="font-semibold text-lg">Edit</span>
              <span></span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <img src={bookmark?.image} alt={bookmark?.title} className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <div className="font-semibold text-base">{bookmark?.title}</div>
                <div className="text-gray-500 text-xs mt-1">{bookmark?.description}</div>
              </div>
            </div>
            <form className="flex flex-col gap-4" onSubmit={handleEditSubmit}>
              <div>
                <label className="block text-sm mb-1 font-medium">Collection</label>
                <select value={editGroup} onChange={e => setEditGroup(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white">
                  {groups.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 font-medium">Tags</label>
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                  {editTags.map(tag => (
                    <span key={tag} className="bg-[color:var(--primary)] text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      #{tag}
                      <button type="button" className="ml-1 text-xs" onClick={() => handleRemoveEditTag(tag)}>&times;</button>
                    </span>
                  ))}
                  <input
                    className="flex-1 min-w-[80px] border-none outline-none bg-transparent text-sm"
                    placeholder="Add tags..."
                    value={editTagInput}
                    onChange={e => setEditTagInput(e.target.value)}
                    onKeyDown={handleEditTagInput}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1 font-medium">URL</label>
                <input type="url" value={editUrl} onChange={e => setEditUrl(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white" />
                <div className="text-xs text-gray-400 mt-1">Saved {bookmark && new Date(Number(bookmark.id)).toLocaleString()}</div>
              </div>
              <div className="flex gap-4 mt-4">
                <button type="submit" className="flex-1 bg-[color:var(--primary)] text-white rounded-2xl py-3 font-semibold text-base active:bg-[color:var(--primary-dark)] transition">Edit</button>
                <button type="button" className="flex-1 bg-gray-800 text-white rounded-2xl py-3 font-semibold text-base" onClick={() => setEditOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80">
            <div className="font-semibold mb-4">Delete this bookmark?</div>
            <div className="flex gap-4 mt-2">
              <button className="flex-1 bg-[color:var(--primary)] text-white rounded-2xl py-2 font-semibold" onClick={handleDelete}>Delete</button>
              <button className="flex-1 bg-gray-800 text-white rounded-2xl py-2 font-semibold" onClick={() => setDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <BottomNavbar />
    </div>
  );
}