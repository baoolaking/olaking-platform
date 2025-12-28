"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { WalletBalanceCard } from "@/components/dashboard/wallet/wallet-balance-card";
import { FundingForm } from "@/components/dashboard/wallet/funding-form";
import { PaymentInstructions } from "@/components/dashboard/wallet/payment-instructions";
import { PaymentWaitingState } from "@/components/dashboard/wallet/payment-waiting-state";
import { MigrationStatusChecker } from "@/components/dashboard/wallet/migration-status";
import { TransactionHistory } from "@/components/dashboard/wallet/transaction-history";
import { TikTokCoinBanner } from "@/components/common/TikTokCoinBanner";
import { useWallet } from "@/hooks/use-wallet";
import { useWalletFunding } from "@/hooks/use-wallet-funding";
import { fundWalletSchema, type FundWalletInput } from "@/lib/validations/wallet";

export default function WalletPage() {
  const { userData, bankAccounts, transactions, minFundingAmount, isLoading, loadData } = useWallet();
  const { isFunding, isPolling, pendingPayment, isConfirmed, createFundingRequest, handlePaymentConfirmed, refreshPaymentStatus } = useWalletFunding(userData, loadData);
  const [showFundingForm, setShowFundingForm] = useState(false);

  const handleFundWallet = () => {
    setShowFundingForm(true);
  };

  const handleFundingSubmit = async (data: FundWalletInput): Promise<boolean> => {
    const success = await createFundingRequest(data.amount, data.bank_account_id, minFundingAmount);
    if (success) {
      setShowFundingForm(false);
    }
    return success || false;
  };

  const handleCancelFunding = () => {
    setShowFundingForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load wallet data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TikTok Coin Promotion Banner */}
      <TikTokCoinBanner
        whatsappNumber={userData?.whatsapp_no || "your-whatsapp-number"}
        className="mb-4"
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Wallet</h1>
        <p className="text-muted-foreground">Manage your wallet balance and transactions</p>
      </div>

      {/* Migration Status Checker */}
      <MigrationStatusChecker />

      {/* Debug Tool - Remove this after fixing */}
      {/* <TestPaymentButton /> */}

      {/* Wallet Balance Card */}
      <WalletBalanceCard
        balance={userData.wallet_balance}
        onFundWallet={handleFundWallet}
        showFundingForm={showFundingForm}
        isPolling={isPolling}
      />

      {/* Funding Form */}
      {showFundingForm && (
        <FundingForm
          bankAccounts={bankAccounts}
          minFundingAmount={minFundingAmount}
          isFunding={isFunding}
          onSubmit={handleFundingSubmit}
          onCancel={handleCancelFunding}
        />
      )}

      {/* Pending Payment Instructions or Waiting State */}
      {pendingPayment && (
        <>
          {!isConfirmed ? (
            <PaymentInstructions
              amount={pendingPayment.amount}
              bankAccountId={pendingPayment.bank_account_id}
              bankAccounts={bankAccounts}
              orderId={pendingPayment.order_id}
              onPaymentConfirmed={handlePaymentConfirmed}
            />
          ) : (
            <PaymentWaitingState
              orderId={pendingPayment.order_id}
              orderNumber={pendingPayment.order_number}
              amount={pendingPayment.amount}
              onRefresh={refreshPaymentStatus}
            />
          )}
        </>
      )}

      {/* Transaction History */}
      <TransactionHistory transactions={transactions} />
    </div>
  );
}