import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddPage from '@/app/add/page';
import StorageService from '@/services/StorageService';

jest.mock('@/services/StorageService');
const mockedStorage = StorageService as jest.Mocked<typeof StorageService>;

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/', // or any path you want to simulate
}));

describe('AddPage', () => {
  beforeEach(() => {
    mockedStorage.getBookmarks.mockReturnValue([]);
    mockedStorage.saveBookmarks.mockClear();
  });

  it('renders all input fields and buttons', () => {
    render(<AddPage />);
    expect(screen.getByLabelText(/URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Collection/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tags/i)).toBeInTheDocument();
    expect(screen.getByText(/Add/)).toBeInTheDocument();
    expect(screen.getByText(/Cancel/)).toBeInTheDocument();
  });

  it('allows entering a URL', () => {
    render(<AddPage />);
    const urlInput = screen.getByPlaceholderText(/Paste or type a URL/i);
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    expect(urlInput).toHaveValue('https://example.com');
  });

  it('adds tags when space or enter is pressed', () => {
    render(<AddPage />);
    const tagInput = screen.getByPlaceholderText(/Add tags/i);
    fireEvent.change(tagInput, { target: { value: 'react' } });
    fireEvent.keyDown(tagInput, { key: ' ' });
    expect(screen.getByText('#react')).toBeInTheDocument();
  });

  it('adds a new group and selects it', () => {
    render(<AddPage />);
    fireEvent.click(screen.getByText('Unsorted'));
    const groupInput = screen.getByPlaceholderText(/Search or add group/i);
    fireEvent.change(groupInput, { target: { value: 'NewGroup' } });
    fireEvent.keyDown(groupInput, { key: 'Enter' });
    expect(screen.getByText('NewGroup')).toBeInTheDocument();
  });

  it('shows error if metadata fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    render(<AddPage />);
    const urlInput = screen.getByPlaceholderText(/Paste or type a URL/i);
    fireEvent.change(urlInput, { target: { value: 'https://fail.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    await waitFor(() => expect(screen.getByText(/Could not fetch metadata/i)).toBeInTheDocument());
  });

  it('saves bookmark and navigates on successful submit', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ title: 'Test', description: 'desc', image: '', url: 'https://test.com', source: 'test.com' })
    });
    render(<AddPage />);
    const urlInput = screen.getByPlaceholderText(/Paste or type a URL/i);
    fireEvent.change(urlInput, { target: { value: 'https://test.com' } });
    fireEvent.click(screen.getByText('Add'));
    await waitFor(() => {
      expect(mockedStorage.saveBookmarks).toHaveBeenCalled();
    });
  });
});