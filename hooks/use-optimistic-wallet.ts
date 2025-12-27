"use client";

import { useState, useCallback } from "react";
import { broadcastWalletUpdate } from "./use-wallet-context";

interface OptimisticWalletState {
  balance: number;
  isOptimistic: boolean;
  originalBalance: number;
}

export function useOptimisticWallet(initialBalance: number) {
  const [walletState, setWalletState] = useState<OptimisticWalletState>({
    balance: initialBalance,
    isOptimistic: false,
    originalBalance: initialBalance,
  });

  const updateBalance = useCallback((newBalance: number, isOptimistic = false) => {
    setWalletState(prev => ({
      balance: newBalance,
      isOptimistic,
      originalBalance: isOptimistic ? prev.originalBalance : newBalance,
    }));

    if (!isOptimistic) {
      // Broadcast the confirmed balance update
      broadcastWalletUpdate(newBalance);
    }
  }, []);

  const optimisticDeduct = useCallback((amount: number) => {
    setWalletState(prev => ({
      balance: prev.balance - amount,
      isOptimistic: true,
      originalBalance: prev.originalBalance,
    }));
  }, []);

  const confirmDeduction = useCallback((actualNewBalance: number) => {
    setWalletState({
      balance: actualNewBalance,
      isOptimistic: false,
      originalBalance: actualNewBalance,
    });
    broadcastWalletUpdate(actualNewBalance);
  }, []);

  const revertOptimistic = useCallback(() => {
    setWalletState(prev => ({
      balance: prev.originalBalance,
      isOptimistic: false,
      originalBalance: prev.originalBalance,
    }));
  }, []);

  return {
    balance: walletState.balance,
    isOptimistic: walletState.isOptimistic,
    updateBalance,
    optimisticDeduct,
    confirmDeduction,
    revertOptimistic,
  };
}