import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WalletCarousel } from '../src/components/dashboard/WalletCarousel';
import { Wallet } from '../src/types';

describe('WalletCarousel Currency Rendering', () => {
  it('renders wallet with its own currency symbol (PHP => ₱, USD => $)', () => {
    const wallets: Wallet[] = [
      {
        id: 'w-php',
        name: 'Peso Pocket',
        type: 'cash',
        balance: 250,
        currency: 'PHP',
        icon: 'banknote',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'w-usd',
        name: 'Dollar Stash',
        type: 'savings',
        balance: 100,
        currency: 'USD',
        icon: 'vault',
        updatedAt: new Date().toISOString(),
      },
    ];

    render(<WalletCarousel wallets={wallets} />);

    // Peso pocket should display ₱250.00
    expect(screen.getByText('₱250.00')).toBeInTheDocument();
    // Dollar stash should display $100.00
    expect(screen.getByText('$100.00')).toBeInTheDocument();
  });

  it('defaults currencySymbol to ₱ when wallet has no currency set', () => {
    const wallets: Wallet[] = [
      {
        id: 'w-fallback',
        name: 'Generic Wallet',
        type: 'cash',
        balance: 500,
        currency: '',
        icon: 'banknote',
        updatedAt: new Date().toISOString(),
      },
    ];

    render(<WalletCarousel wallets={wallets} />);

    expect(screen.getByText('₱500.00')).toBeInTheDocument();
  });
});
