import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BottomNavbar from '../../components/BottomNavbar';
import { usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('BottomNavbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all navigation items', () => {
    (usePathname as jest.Mock).mockReturnValue('/explore');
    render(<BottomNavbar />);
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByText('My Posts')).toBeInTheDocument();
    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  it('highlights the active nav item based on pathname', () => {
    (usePathname as jest.Mock).mockReturnValue('/myposts');
    render(<BottomNavbar />);
    const myPosts = screen.getByText('My Posts');
    expect(myPosts).toHaveClass('text-[color:var(--primary-dark)]');
    expect(myPosts).toHaveClass('font-semibold');
  });

  it('all nav items have correct hrefs', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    render(<BottomNavbar />);
    expect(screen.getByText('Explore').closest('a')).toHaveAttribute('href', '/explore');
    expect(screen.getByText('Add').closest('a')).toHaveAttribute('href', '/add');
    expect(screen.getByText('My Posts').closest('a')).toHaveAttribute('href', '/myposts');
    expect(screen.getByText('Private').closest('a')).toHaveAttribute('href', '/private');
    expect(screen.getByText('Account').closest('a')).toHaveAttribute('href', '/account');
  });
});