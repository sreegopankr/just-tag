'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import StorageService from '@/services/StorageService';
import { Bookmark } from '@/types/bookmark';
import BottomNavbar from '@/components/BottomNavbar';
import { seedBookmarksIfEmpty } from '@/utils/seedBookmarks';

export default function GroupPage() {
  const params = useParams();
  const groupName = decodeURIComponent(params.group as string);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const router = useRouter();

  useEffect(() => {
    seedBookmarksIfEmpty();
    const allBookmarks = StorageService.getBookmarks();
    console.log('allBookmarks', allBookmarks);
    const filtered = allBookmarks.filter((b: Bookmark) => (b.group || 'Unsorted') === groupName);
    setBookmarks(filtered);
  }, [groupName]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pb-20 text-black">
      <div className="py-6 text-center fixed top-0 left-0 right-0 font-bold text-lg bg-white shadow-sm mb-2 text-black">{groupName}</div>
      <div className="flex-1 px-2 pt-20">
        {bookmarks.map(b => (
          <div 
            key={b.id}
            onClick={() => router.push(`/private/${encodeURIComponent(groupName)}/${b.id}`)} 
            className="flex items-center p-3 mb-3 bg-white rounded-xl shadow-md">
            <img src={b.image} alt={b.title} className="w-14 h-14 rounded object-cover mr-3" />
            <div className="flex flex-col flex-1">
              <span className="font-medium text-base text-gray-900 line-clamp-2">{b.title}</span>
              <span className="text-xs text-gray-500 mt-1">{b.source}</span>
            </div>
          </div>
        ))}
        {bookmarks.length === 0 && (
          <div className="text-center text-gray-400 mt-10">No bookmarks in this group.</div>
        )}
      </div>
      <div className="px-4 py-4">
        <button className="w-full bg-[color:var(--primary)] text-white rounded-lg py-3 font-semibold text-base active:bg-[color:var(--primary-dark)]  transition">Post for public</button>
      </div>
      <BottomNavbar />
    </div>
  );
}