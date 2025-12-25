"use client";

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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";

interface OrderFiltersProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  paymentMethodFilter: string;
  setPaymentMethodFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  onClearFilters: () => void;
  totalResults: number;
  filteredResults: number;
  currentResults: number;
}

export function OrderFilters({
  statusFilter,
  setStatusFilter,
  paymentMethodFilter,
  setPaymentMethodFilter,
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
  onClearFilters,
  totalResults,
  filteredResults,
  currentResults,
}: OrderFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Order ID, platform, link..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="awaiting_payment">Awaiting Payment</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="awaiting_refund">Awaiting Refund</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method Filter */}
          <div className="space-y-2">
            <Label htmlFor="payment-filter">Payment Method</Label>
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Filter */}
          <div className="space-y-2">
            <Label htmlFor="date-filter">Date Range</Label>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Results Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {currentResults} of {filteredResults} orders
            {filteredResults !== totalResults && ` (filtered from ${totalResults} total)`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}