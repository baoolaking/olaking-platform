"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Plus, Minus, Wallet } from "lucide-react";
import { Order } from "@/hooks/use-admin-orders";

interface WalletUpdateDialogProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (userId: string, orderId: string, amount: number, action: "add" | "subtract") => Promise<boolean>;
}

export function WalletUpdateDialog({
  order,
  isOpen,
  onClose,
  onUpdate,
}: WalletUpdateDialogProps) {
  const [walletAmount, setWalletAmount] = useState("");
  const [walletAction, setWalletAction] = useState<"add" | "subtract">("add");
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if this is a wallet funding order
  const isWalletFundingOrder = order?.service_id === null && order?.link === "wallet_funding";
  const intendedFundingAmount = isWalletFundingOrder ? order?.total_price : null;

  // Auto-prefill amount for wallet funding orders
  useEffect(() => {
    if (isOpen && isWalletFundingOrder && intendedFundingAmount) {
      setWalletAmount(intendedFundingAmount.toString());
      setWalletAction("add"); // Default to add for wallet funding
    } else if (isOpen && !isWalletFundingOrder) {
      setWalletAmount(""); // Clear for non-wallet funding orders
    }
  }, [isOpen, isWalletFundingOrder, intendedFundingAmount]);

  const handleUpdate = async () => {
    if (!order || !walletAmount) return;

    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    setIsUpdating(true);
    try {
      const success = await onUpdate(order.user_id, order.id, amount, walletAction);
      if (success) {
        setWalletAmount("");
        onClose();
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      setWalletAmount("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User Wallet</DialogTitle>
          <DialogDescription>
            Add or subtract funds from {order?.users?.full_name}'s wallet
          </DialogDescription>
        </DialogHeader>

        {/* Show intended funding amount for wallet funding orders */}
        {isWalletFundingOrder && intendedFundingAmount && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
              <Wallet className="h-4 w-4" />
              Wallet Funding Request
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              ₦{intendedFundingAmount.toLocaleString()}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              This user intended to fund their wallet with this amount
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="action">Action</Label>
            <Select value={walletAction} onValueChange={(value: "add" | "subtract") => setWalletAction(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-green-600" />
                    Add Funds
                  </div>
                </SelectItem>
                <SelectItem value="subtract">
                  <div className="flex items-center gap-2">
                    <Minus className="h-4 w-4 text-red-600" />
                    Subtract Funds
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={walletAmount}
              onChange={(e) => setWalletAmount(e.target.value)}
              min="0"
              step="0.01"
              disabled={isUpdating}
            />
            {isWalletFundingOrder && intendedFundingAmount && (
              <div className="text-xs text-muted-foreground">
                Amount auto-filled from wallet funding request
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating || !walletAmount}>
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {walletAction === "add" ? "Add Funds" : "Subtract Funds"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}