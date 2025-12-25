"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";

interface MigrationStatus {
  migrationNeeded: boolean;
  status: string;
  error?: string;
  solution?: string;
}

export function MigrationStatusChecker() {
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkMigration = async () => {
    setIsChecking(true);
    try {
      const response = await fetch("/api/wallet/check-migration");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Failed to check migration:", error);
      setStatus({
        migrationNeeded: true,
        status: "Failed to check migration status",
        error: "Network error"
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkMigration();
  }, []);

  if (!status || (!status.migrationNeeded && !status.error)) {
    return null; // Don't show anything if migration is fine
  }

  if (status.migrationNeeded === false && status.status?.includes('✅')) {
    return null; // Migration is successful, don't show warning
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-orange-800 dark:text-orange-200">
              Database Migration Required
            </h4>
            <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
              {status.status}
            </p>
            {status.solution && (
              <div className="mt-2 p-2 bg-orange-100 dark:bg-orange-900 rounded text-xs font-mono">
                {status.solution}
              </div>
            )}
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              Please run the above SQL command in your Supabase SQL Editor, then refresh this page.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkMigration}
            disabled={isChecking}
            className="flex-shrink-0"
          >
            {isChecking ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}