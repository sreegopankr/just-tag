import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BookmarkDetailPage from '@/app/private/[group]/[id]/page';
import StorageService from '@/services/StorageService';

jest.mock('@/services/StorageService');
const mockedStorage = StorageService as jest.Mocked<typeof StorageService>;

jest.mock('next/navigation', () => ({
  useParams: () => ({ group: encodeURIComponent('Group1'), id: '1' }),
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  usePathname: () => '/private/Group1/1',
}));

describe('BookmarkDetailPage', () => {
  beforeEach(() => {
    mockedStorage.getBookmarks.mockReturnValue([
      { id: '1', group: 'Group1', image: 'img1.png', title: 'Bookmark1', tags: ['tag1'], url: 'https://test.com', source: 'test.com', description: 'desc' },
    ]);
  });

  it('renders bookmark details', () => {
    render(<BookmarkDetailPage />);
    expect(screen.getByText('Bookmark1')).toBeInTheDocument();
    expect(screen.getByText('test.com')).toBeInTheDocument();
  });

  it('shows "Bookmark not found" if bookmark does not exist', () => {
    mockedStorage.getBookmarks.mockReturnValue([]);
    render(<BookmarkDetailPage />);
    expect(screen.getByText(/Bookmark not found/i)).toBeInTheDocument();
  });

  it('opens edit drawer when edit button is clicked', () => {
    render(<BookmarkDetailPage />);
    fireEvent.click(screen.getAllByRole('button')[1]); // Edit button
    expect(screen.getByText(/Edit/i)).toBeInTheDocument();
  });
});