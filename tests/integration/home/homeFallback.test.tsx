import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HomeAccessBoundary } from '../../../src/pages/home/HomeAccessBoundary';

describe('home fallback for unauthorized users', () => {
  it('renders access denied state when movie access is not allowed', () => {
    render(
      <HomeAccessBoundary allowed={false}>
        <div>allowed-content</div>
      </HomeAccessBoundary>
    );

    expect(screen.getByText('Acesso negado')).toBeInTheDocument();
  });
});
