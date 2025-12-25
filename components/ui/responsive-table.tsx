"use client";

import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Column<T = Record<string, unknown>> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => ReactNode;
  isPrimary?: boolean;
  type?: "status" | "default";
}

interface ResponsiveTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  getMobileTitle?: (row: T) => ReactNode;
}

const renderCellValue = (value: unknown, columnType?: string) => {
  if (columnType === "status") {
    const isActive = value === "Active" || value === true;
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  }
  return String(value);
};

export function ResponsiveTable<T = Record<string, unknown>>({
  columns,
  data,
  keyField,
  getMobileTitle,
}: ResponsiveTableProps<T>) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-medium text-muted-foreground"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={`${String(row[keyField])}-${idx}`}
                className="border-b hover:bg-muted/50"
              >
                {columns.map((col) => (
                  <td
                    key={`${String(row[keyField])}-${col.key}`}
                    className="px-4 py-3"
                  >
                    {col.render
                      ? col.render(row[col.key as keyof T], row)
                      : renderCellValue(row[col.key as keyof T], col.type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Accordion */}
      <div className="md:hidden">
        <Accordion type="multiple" className="space-y-2">
          {data.map((row, idx) => {
            // Use custom title generator if provided, otherwise use primary column
            const primaryValue = getMobileTitle
              ? getMobileTitle(row)
              : (() => {
                  const primaryCol =
                    columns.find((col) => col.isPrimary) || columns[0];
                  return primaryCol.render
                    ? primaryCol.render(row[primaryCol.key as keyof T], row)
                    : renderCellValue(
                        row[primaryCol.key as keyof T],
                        primaryCol.type
                      );
                })();

            return (
              <AccordionItem
                key={`${String(row[keyField])}-${idx}`}
                value={`item-${idx}`}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-2">
                    <span className="font-medium text-sm">{primaryValue}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2 pb-3">
                    {columns.map((col) => (
                      <div
                        key={`${String(row[keyField])}-${col.key}`}
                        className="flex flex-col"
                      >
                        <span className="text-xs font-medium text-muted-foreground">
                          {col.label}
                        </span>
                        <span className="text-sm font-medium mt-1">
                          {col.render
                            ? col.render(row[col.key as keyof T], row)
                            : renderCellValue(
                                row[col.key as keyof T],
                                col.type
                              )}
                        </span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </>
  );
}
