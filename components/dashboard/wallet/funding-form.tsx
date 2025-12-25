"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CreditCard, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fundWalletSchema, type FundWalletInput } from "@/lib/validations/wallet";
import { BankAccount } from "@/hooks/use-wallet";

interface FundingFormProps {
  bankAccounts: BankAccount[];
  minFundingAmount: number;
  isFunding: boolean;
  onSubmit: (data: FundWalletInput) => Promise<boolean>;
  onCancel: () => void;
}

export function FundingForm({
  bankAccounts,
  minFundingAmount,
  isFunding,
  onSubmit,
  onCancel,
}: FundingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FundWalletInput>({
    resolver: zodResolver(fundWalletSchema),
  });

  const watchedAmount = watch("amount");

  const handleFormSubmit = async (data: FundWalletInput) => {
    const success = await onSubmit(data);
    if (success) {
      reset();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Fund Your Wallet
        </CardTitle>
        <CardDescription>
          Add money to your wallet via bank transfer. Minimum amount: ₦{minFundingAmount.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                placeholder={`Minimum ₦${minFundingAmount.toLocaleString()}`}
                {...register("amount", { valueAsNumber: true })}
                disabled={isFunding}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">
                  {errors.amount.message}
                </p>
              )}
              {watchedAmount && watchedAmount < minFundingAmount && (
                <p className="text-sm text-destructive">
                  Amount must be at least ₦{minFundingAmount.toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_account_id">Select Bank Account</Label>
              <Select
                value={watch("bank_account_id") || ""}
                onValueChange={(value) => setValue("bank_account_id", value)}
                disabled={isFunding}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose bank account..." />
                </SelectTrigger>
                <SelectContent className="z-50">
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {account.bank_name} - {account.account_number}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {account.account_name}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bank_account_id && (
                <p className="text-sm text-destructive">
                  {errors.bank_account_id.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={isFunding} className="w-full sm:w-auto">
              {isFunding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Funding Request
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isFunding}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}