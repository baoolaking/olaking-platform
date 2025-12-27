"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { WalletBalanceDisplay } from "@/components/services/wallet-balance-display";
import { ServicesFilters } from "@/components/services/services-filters";
import { PlatformTabs } from "@/components/services/platform-tabs";
import { OrderFormModal } from "@/components/services/order-form-modal";
import { useServices } from "@/hooks/use-services";
import { useServicesFilters } from "@/hooks/use-services-filters";
import { Service } from "@/components/services/types";

export default function ServicesPage() {
  const router = useRouter();
  const { isLoading, services, bankAccounts, userData, refreshUserData } = useServices();
  const { searchTerm, setSearchTerm } = useServicesFilters();

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setShowOrderForm(true);
  };

  const handleCloseModal = () => {
    setShowOrderForm(false);
    setSelectedService(null);
  };

  const handleOrderSuccess = () => {
    setShowOrderForm(false);
    setSelectedService(null);
    router.push("/dashboard/orders");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="text-muted-foreground">Browse and purchase social media boosting services</p>
      </div>

      {/* Wallet Balance Display */}
      <WalletBalanceDisplay userData={userData} />

      {/* Search Filter */}
      <ServicesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Platform Tabs with Services */}
      <PlatformTabs
        services={services}
        onServiceSelect={handleServiceSelect}
        searchTerm={searchTerm}
      />

      {/* Order Form Modal */}
      {showOrderForm && selectedService && (
        <OrderFormModal
          service={selectedService}
          userData={userData}
          bankAccounts={bankAccounts}
          onClose={handleCloseModal}
          onSuccess={handleOrderSuccess}
          onRefreshUserData={refreshUserData}
        />
      )}
    </div>
  );
}