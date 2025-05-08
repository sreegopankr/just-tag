import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PrivateCollectionsPage from '@/app/private/page';
import StorageService from '@/services/StorageService';

jest.mock('@/services/StorageService');
const mockedStorage = StorageService as jest.Mocked<typeof StorageService>;

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/private',
}));

describe('PrivateCollectionsPage', () => {
  beforeEach(() => {
    mockedStorage.getBookmarks.mockReturnValue([
      { id: '1', group: 'Group1', image: 'img1.png', title: 'Bookmark1', tags: [], url: '', source: '' },
      { id: '2', group: 'Group2', image: 'img2.png', title: 'Bookmark2', tags: [], url: '', source: '' },
    ]);
    mockedStorage.saveBookmarks.mockClear();
  });

  it('renders collection groups', () => {
    render(<PrivateCollectionsPage />);
    expect(screen.getByText('Private Collections')).toBeInTheDocument();
    expect(screen.getByText('Group1')).toBeInTheDocument();
    expect(screen.getByText('Group2')).toBeInTheDocument();
  });

  it('opens edit modal when edit button is clicked', () => {
    render(<PrivateCollectionsPage />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(screen.getByText(/Edit Group Name/i)).toBeInTheDocument();
  });

  it('opens delete modal when delete button is clicked', () => {
    render(<PrivateCollectionsPage />);
    fireEvent.click(screen.getAllByRole('button')[1]);
    expect(screen.getByText(/Delete group/i)).toBeInTheDocument();
  });
});