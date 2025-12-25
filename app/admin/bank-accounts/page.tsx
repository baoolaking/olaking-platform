import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BankAccountForm } from "@/components/admin/BankAccountForm";
import { BankAccountsTableClient } from "@/components/admin/BankAccountsTableClient";

export default async function AdminBankAccountsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch all bank accounts
  const { data: bankAccounts, error: bankAccountsError } = await supabase
    .from("bank_accounts")
    .select("*")
    .order("created_at", { ascending: false });

  if (bankAccountsError) {
    console.error("Error fetching bank accounts:", bankAccountsError);
  }

  // Calculate stats
  const totalAccounts = bankAccounts?.length || 0;
  const activeAccounts = bankAccounts?.filter((a) => a.is_active).length || 0;
  const inactiveAccounts = totalAccounts - activeAccounts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Bank Accounts Management</h1>
        <p className="text-muted-foreground">
          Manage payment bank accounts for the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAccounts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAccounts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveAccounts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts Table */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <CardTitle>All Bank Accounts</CardTitle>
            <CardDescription>
              Payment accounts for receiving customer deposits
            </CardDescription>
          </div>
          <BankAccountForm />
        </CardHeader>
        <CardContent>
          {!bankAccounts || bankAccounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                No bank accounts configured yet
              </p>
              <p className="text-xs text-muted-foreground">
                Add bank accounts to receive customer payments
              </p>
            </div>
          ) : (
            <BankAccountsTableClient accounts={bankAccounts} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
