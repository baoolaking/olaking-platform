"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, TrendingUp, Globe } from "lucide-react";
import { WalletBalanceDisplay } from "@/components/services/wallet-balance-display";
import { ServicesFilters } from "@/components/services/services-filters";
import { PlatformSelection } from "@/components/services/platform-selection";
import { PlatformServicesView } from "@/components/services/platform-services-view";
import { OtherServicesView } from "@/components/services/other-services-view";
import { OrderFormModal } from "@/components/services/order-form-modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TikTokCoinBanner } from "@/components/common/TikTokCoinBanner";
import { useServices } from "@/hooks/use-services";
import { useServicesFilters } from "@/hooks/use-services-filters";
import { Service } from "@/components/services/types";

export default function ServicesPage() {
  const router = useRouter();
  const { isLoading, services, bankAccounts, userData, refreshUserData } = useServices();
  const { searchTerm, setSearchTerm } = useServicesFilters();

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("social-media");

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

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
  };

  const handleBackToPlatforms = () => {
    setSelectedPlatform(null);
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    // If user starts searching while viewing a platform, go back to platform selection
    if (newSearchTerm && selectedPlatform) {
      setSelectedPlatform(null);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset platform selection when switching tabs
    setSelectedPlatform(null);
    // Clear search when switching tabs
    setSearchTerm("");
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
      {/* TikTok Coin Promotion Banner */}
      <TikTokCoinBanner
        whatsappNumber={userData?.whatsapp_no || "your-whatsapp-number"}
        className="mb-4"
      />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="text-muted-foreground">
          {selectedPlatform
            ? `Browse ${selectedPlatform} services`
            : activeTab === "social-media"
              ? "Browse and purchase social media boosting services"
              : "Additional services available via WhatsApp consultation"
          }
        </p>
      </div>

      {/* Wallet Balance Display */}
      <WalletBalanceDisplay userData={userData} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full h-full grid-cols-2 max-w-sm mx-auto sm:max-w-md sm:mx-0">
          <TabsTrigger value="social-media" className="flex items-center gap-1 sm:gap-2 text-sm px-2 sm:px-3">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Social Media</span>
            <span className="sm:hidden">Social</span>
          </TabsTrigger>
          <TabsTrigger value="others" className="flex items-center gap-1 sm:gap-2 text-sm px-2 sm:px-3">
            <Globe className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            Others
          </TabsTrigger>
        </TabsList>

        {/* Search Filter - Only show for social media tab or when searching */}
        {(activeTab === "social-media" || searchTerm) && (
          <ServicesFilters
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />
        )}

        <TabsContent value="social-media" className="space-y-6">
          {/* Conditional Rendering: Platform Selection or Platform Services */}
          {!selectedPlatform ? (
            <PlatformSelection
              services={services}
              onPlatformSelect={handlePlatformSelect}
              searchTerm={searchTerm}
            />
          ) : (
            <PlatformServicesView
              platform={selectedPlatform}
              services={services}
              onServiceSelect={handleServiceSelect}
              onBack={handleBackToPlatforms}
              searchTerm={searchTerm}
            />
          )}
        </TabsContent>

        <TabsContent value="others" className="space-y-6">
          {/* Search Filter for Others tab */}
          <ServicesFilters
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />

          <OtherServicesView searchTerm={searchTerm} />
        </TabsContent>
      </Tabs>

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