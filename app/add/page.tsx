'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import StorageService from '@/services/StorageService';
import { Bookmark } from '@/types/bookmark';
import BottomNavbar from '@/components/BottomNavbar';

export default function AddPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [group, setGroup] = useState('Unsorted');
  const [groupInput, setGroupInput] = useState('');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [groups, setGroups] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const groupDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bookmarks = StorageService.getBookmarks();
    const uniqueGroups = Array.from(new Set(bookmarks.map((b : Bookmark) => b.group || 'Unsorted')));
    setGroups(uniqueGroups as string[]);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(event.target as Node)) {
        setShowGroupDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleAddTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === ' ' || e.key === 'Enter') && tagInput.trim()) {
      const newTag = tagInput.trim().replace(/^#/, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
      e.preventDefault();
    }
  }

  function handleRemoveTag(tag: string) {
    setTags(tags.filter(t => t !== tag));
  }

  function handleAddGroup() {
    if (groupInput.trim() && !groups.includes(groupInput.trim())) {
      setGroups([groupInput.trim(), ...groups]);
      setGroup(groupInput.trim());
      setGroupInput('');
      setShowGroupDropdown(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/metadata?url=${encodeURIComponent(url)}`);
      console.log(encodeURIComponent(url));
      if (!res.ok) throw new Error('Failed to fetch metadata');
      const meta = await res.json();
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        title: meta.title || url,
        description: meta.description || '',
        image: meta.image || '',
        url: meta.url || url,
        group,
        tags,
        source: meta.source || ''
      };
      const bookmarks = StorageService.getBookmarks();
      StorageService.saveBookmarks([newBookmark, ...bookmarks]);
      router.push('/private');
    } catch (err) {
      setError('Could not fetch metadata for this URL.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col pb-20 text-black">
      <header className="py-6 text-center font-bold text-lg bg-white shadow-sm mb-2">Add</header>
      <form className="flex flex-col items-center px-4 pt-4 gap-6 flex-1" onSubmit={handleSubmit}>
        <div className="w-full">
          <label className="block text-sm mb-1 font-medium">URL</label>
          <input
            type="url"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
            placeholder="Paste or type a URL"
            value={url}
            onChange={e => setUrl(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="w-full relative" ref={groupDropdownRef}>
          <label className="block text-sm mb-1 font-medium">Collection</label>
          <div
            className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 cursor-pointer"
            onClick={() => setShowGroupDropdown(v => !v)}
          >
            <span className="flex-1 text-gray-900">{group}</span>
            <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </div>
          {showGroupDropdown && (
            <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg mt-1 z-10 max-h-48 overflow-y-auto shadow-lg">
              <input
                className="w-full px-3 py-2 border-b border-gray-100 focus:outline-none"
                placeholder="Search or add group"
                value={groupInput}
                onChange={e => setGroupInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { handleAddGroup(); e.preventDefault(); } }}
              />
              {groupInput.trim() && !groups.includes(groupInput.trim()) && (
                <div className="px-3 py-2 text-[color:var(--primary)] cursor-pointer hover:bg-gray-50" onClick={handleAddGroup}>
                  + Add "{groupInput.trim()}"
                </div>
              )}
              {groups.filter(g => g.toLowerCase().includes(groupInput.toLowerCase())).map(g => (
                <div
                  key={g}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => { setGroup(g); setShowGroupDropdown(false); }}
                >
                  {g}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="w-full">
          <label className="block text-sm mb-1 font-medium">Tags</label>
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
            {tags.map(tag => (
              <span key={tag} className="bg-[color:var(--primary)] text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                #{tag}
                <button type="button" className="ml-1 text-xs" onClick={() => handleRemoveTag(tag)}>&times;</button>
              </span>
            ))}
            <input
              className="flex-1 min-w-[80px] border-none outline-none bg-transparent text-sm"
              placeholder="Add tags..."
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              disabled={loading}
            />
          </div>
        </div>
        {error && <div className="text-red-500 text-sm w-full text-center">{error}</div>}
        <div className="flex gap-4 w-full justify-center mt-4">
          <button type="submit" className="flex-1 bg-[color:var(--primary)] text-white rounded-lg py-3 font-semibold text-base active:bg-[color:var(--primary-dark)] transition" disabled={loading}>{loading ? 'Adding...' : 'Add'}</button>
          <button type="button" className="flex-1 bg-gray-800 text-white rounded-lg py-3 font-semibold text-base" onClick={() => router.push('/private')} disabled={loading}>Cancel</button>
        </div>
      </form>
      <BottomNavbar />
    </div>
  );
}