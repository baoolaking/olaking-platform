"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface WalletContextType {
  walletBalance: number | null;
  updateWalletBalance: (newBalance: number) => void;
  refreshWalletBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
  initialBalance?: number;
}

export function WalletProvider({ children, initialBalance = 0 }: WalletProviderProps) {
  const [walletBalance, setWalletBalance] = useState<number | null>(initialBalance);

  const updateWalletBalance = useCallback((newBalance: number) => {
    setWalletBalance(newBalance);
  }, []);

  const refreshWalletBalance = useCallback(async () => {
    // This will be implemented by individual components that need to refresh
    // For now, we'll just trigger a custom event that components can listen to
    window.dispatchEvent(new CustomEvent('wallet-balance-refresh'));
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletBalance,
        updateWalletBalance,
        refreshWalletBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
}

// Custom hook for components that need to listen to wallet updates
export function useWalletUpdates(onUpdate: (balance: number) => void) {
  React.useEffect(() => {
    const handleWalletUpdate = (event: CustomEvent<{ balance: number }>) => {
      onUpdate(event.detail.balance);
    };

    const handleWalletRefresh = () => {
      // Trigger refresh in the component
      onUpdate(-1); // Use -1 as a signal to refresh
    };

    const handleVisibilityChange = () => {
      // When page becomes visible again, trigger a refresh
      if (!document.hidden) {
        console.log("Page became visible, triggering wallet refresh");
        handleWalletRefresh();
      }
    };

    const handleFocus = () => {
      // When window gets focus, trigger a refresh
      console.log("Window focused, triggering wallet refresh");
      handleWalletRefresh();
    };

    window.addEventListener('wallet-balance-update', handleWalletUpdate as EventListener);
    window.addEventListener('wallet-balance-refresh', handleWalletRefresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('wallet-balance-update', handleWalletUpdate as EventListener);
      window.removeEventListener('wallet-balance-refresh', handleWalletRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [onUpdate]);
}

// Utility function to broadcast wallet balance updates
export function broadcastWalletUpdate(newBalance: number) {
  console.log(`Broadcasting wallet update: ${newBalance}`);
  window.dispatchEvent(
    new CustomEvent('wallet-balance-update', {
      detail: { balance: newBalance }
    })
  );
}

// Utility function to trigger wallet refresh across all components
export function triggerWalletRefresh() {
  console.log("Triggering wallet refresh across all components");
  window.dispatchEvent(new CustomEvent('wallet-balance-refresh'));
}