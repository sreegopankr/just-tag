import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GroupPage from '@/app/private/[group]/page';
import StorageService from '@/services/StorageService';

jest.mock('@/services/StorageService');
const mockedStorage = StorageService as jest.Mocked<typeof StorageService>;

jest.mock('next/navigation', () => ({
  useParams: () => ({ group: encodeURIComponent('Group1') }),
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/private/Group1',
}));

describe('GroupPage', () => {
  beforeEach(() => {
    mockedStorage.getBookmarks.mockReturnValue([
      { id: '1', group: 'Group1', image: 'img1.png', title: 'Bookmark1', tags: [], url: '', source: '' },
      { id: '2', group: 'Group2', image: 'img2.png', title: 'Bookmark2', tags: [], url: '', source: '' },
    ]);
  });

  it('renders bookmarks for the group', () => {
    render(<GroupPage />);
    expect(screen.getByText('Group1')).toBeInTheDocument();
    expect(screen.getByText('Bookmark1')).toBeInTheDocument();
    expect(screen.queryByText('Bookmark2')).not.toBeInTheDocument();
  });

  it('shows message if no bookmarks in group', () => {
    mockedStorage.getBookmarks.mockReturnValue([]);
    render(<GroupPage />);
    expect(screen.getByText(/No bookmarks in this group/i)).toBeInTheDocument();
  });
});