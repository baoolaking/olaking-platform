"use client";

import { useState } from "react";
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
import { Loader2, Plus, Minus } from "lucide-react";
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