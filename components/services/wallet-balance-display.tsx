"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/wallet/utils";
import { UserData } from "./types";

interface WalletBalanceDisplayProps {
  userData: UserData | null;
}

export function WalletBalanceDisplay({ userData }: WalletBalanceDisplayProps) {
  const router = useRouter();

  if (!userData) return null;

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Wallet className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Wallet Balance</p>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(userData.wallet_balance)}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/wallet")}
        >
          Manage Wallet
        </Button>
      </CardContent>
    </Card>
  );
}