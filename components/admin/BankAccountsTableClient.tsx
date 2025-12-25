/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ResponsiveTable } from "@/components/ui/responsive-table";
import { BankAccountForm } from "@/components/admin/BankAccountForm";
import { DeleteBankAccountButton } from "@/components/admin/DeleteBankAccountButton";

interface BankAccountsTableClientProps {
  accounts: Array<{
    id: string;
    bank_name: string;
    account_name: string;
    account_number: string;
    is_active: boolean;
    created_at: string;
  }>;
}

export function BankAccountsTableClient({
  accounts,
}: BankAccountsTableClientProps) {
  return (
    <ResponsiveTable
      columns={[
        { key: "bank_name", label: "Bank Name" },
        { key: "account_name", label: "Account Name" },
        { key: "account_number", label: "Account Number" },
        {
          key: "is_active",
          label: "Status",
          type: "status",
        },
        {
          key: "created_at",
          label: "Added",
        },
        {
          key: "actions",
          label: "Actions",
          render: (_, row: any) => (
            <div className="flex gap-2">
              <BankAccountForm
                account={{
                  id: row.id,
                  bank_name: row.bank_name,
                  account_name: row.account_name,
                  account_number: row.account_number,
                  is_active: row.is_active === "Active",
                }}
              />
              <DeleteBankAccountButton id={row.id} bankName={row.bank_name} />
            </div>
          ),
        },
      ]}
      data={accounts.map((account) => ({
        ...account,
        is_active: account.is_active ? "Active" : "Inactive",
        created_at: new Date(account.created_at).toLocaleDateString(),
      }))}
      keyField="id"
    />
  );
}
