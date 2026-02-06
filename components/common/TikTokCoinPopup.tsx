"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Coins, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { getTikTokCoinsWhatsAppUrl, TIKTOK_COINS_CONFIG } from "@/lib/config/tiktok-coins";
import { useTikTokPackages } from "@/hooks/use-tiktok-packages";

interface TikTokCoinPopupProps {
  showOnMount?: boolean;
  autoShowDelay?: number;
  whatsappNumber?: string;
  onClose?: () => void;
}

/**
 * Format WhatsApp message with package selection
 */
function formatWhatsAppMessage(selectedPackage?: { coins: number; price: number; display_price: string }): string {
  if (selectedPackage) {
    return `Hi! I would like to purchase ${selectedPackage.coins} TikTok coins for ${selectedPackage.display_price}.\n\nCan you help me complete this order?`;
  }

  return `Hi! I'm interested in purchasing TikTok coins.\n\nPlease let me know the available packages and how to proceed with the purchase.`;
}

export function TikTokCoinPopup({
  showOnMount = false,
  autoShowDelay = TIKTOK_COINS_CONFIG.popup.autoShowDelay,
  whatsappNumber,
  onClose
}: TikTokCoinPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const { packages, loading } = useTikTokPackages();

  useEffect(() => {
    if (showOnMount) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, autoShowDelay);

      return () => clearTimeout(timer);
    }
  }, [showOnMount, autoShowDelay]);

  const handleWhatsAppClick = () => {
    const pkg = selectedPackage !== null ? packages[selectedPackage] : undefined;
    const message = formatWhatsAppMessage(pkg);
    const whatsappUrl = getTikTokCoinsWhatsAppUrl(whatsappNumber, message);
    window.open(whatsappUrl, "_blank");
    setIsOpen(false);
    onClose?.();
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedPackage(null);
    onClose?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Image
              src="/images/tiktok-coin.png"
              alt="TikTok Coin"
              width={24}
              height={24}
              className="sm:w-7 sm:h-7"
            />
            Recharge TikTok Coins
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-center">
            Save around 25% with a lower third-party service fee. Select a package below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-2">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Packages Grid */}
          {!loading && packages.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {packages.map((pkg, index) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(index)}
                  className={`relative p-2.5 sm:p-4 rounded-lg border-2 transition-all ${selectedPackage === index
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700'
                    } ${pkg.is_popular ? 'ring-2 ring-pink-400 ring-offset-1' : ''}`}
                >
                  {pkg.is_popular && (
                    <div className="absolute -top-2 right-1 sm:right-2 bg-pink-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full pointer-events-none select-none">
                      Popular
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Coins className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-yellow-500" />
                      <span className="font-bold text-base sm:text-2xl">{pkg.coins}</span>
                    </div>
                    <span className="font-semibold text-xs sm:text-base">{pkg.display_price}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Packages */}
          {!loading && packages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No packages available at the moment.</p>
              <p className="text-xs mt-1">Please contact support for assistance.</p>
            </div>
          )}

          {/* Benefits */}
          {!loading && packages.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-2.5 sm:p-4">
              <div className="space-y-1 sm:space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 text-xs sm:text-sm flex-shrink-0">✅</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">No login details needed</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 text-xs sm:text-sm flex-shrink-0">✅</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">No email or phone verification</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 text-xs sm:text-sm flex-shrink-0">✅</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">Instant delivery via WhatsApp</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 text-xs sm:text-sm flex-shrink-0">✅</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">24/7 support & secure transactions</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={handleWhatsAppClick}
            className="w-full bg-green-600 hover:bg-green-700 text-xs sm:text-base h-10 sm:h-11"
            size="lg"
            disabled={selectedPackage === null || loading}
          >
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span className="truncate">
              {selectedPackage !== null && packages[selectedPackage]
                ? `Order ${packages[selectedPackage].coins} Coins - ${packages[selectedPackage].display_price}`
                : 'Select a Package to Continue'
              }
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full text-xs sm:text-base h-9 sm:h-10"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
