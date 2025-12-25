"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ShoppingBag,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Wallet,
  CreditCard,
  Filter,
  Search
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  serviceOrderSchema,
  type ServiceOrderInput,
  formatPlatformName,
  formatServiceType,
  validatePlatformServiceType
} from "@/lib/validations/wallet";
import {
  getUserWalletBalance,
  getActiveBankAccounts,
  checkSufficientBalance,
  calculateServicePrice,
  validateServiceQuantity,
  formatCurrency
} from "@/lib/wallet/utils";

interface Service {
  id: string;
  platform: string;
  service_type: string;
  price_per_1k: number;
  is_active: boolean;
  min_quantity: number;
  max_quantity: number;
  delivery_time: string;
  description?: string;
}

interface BankAccount {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  is_active: boolean;
}

interface UserData {
  id: string;
  wallet_balance: number;
  full_name: string;
}

export default function ServicesPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isOrdering, setIsOrdering] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ServiceOrderInput>({
    resolver: zodResolver(serviceOrderSchema),
  });

  const watchedQuantity = watch("quantity");
  const watchedPaymentMethod = watch("payment_method");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, selectedPlatform]);

  useEffect(() => {
    if (selectedService && watchedQuantity) {
      const calculatedPrice = calculateServicePrice(watchedQuantity, selectedService.price_per_1k);
      // Update form with calculated price (for display purposes)
    }
  }, [selectedService, watchedQuantity]);

  const loadData = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return;
      }

      // Load user data
      const { data: userDataResult, error: userError } = await supabase
        .from("users")
        .select("id, wallet_balance, full_name")
        .eq("id", user.id)
        .single();

      if (userError) throw userError;
      setUserData(userDataResult);

      // Load active services
      const { data: servicesResult, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("platform", { ascending: true })
        .order("service_type", { ascending: true });

      if (servicesError) throw servicesError;
      setServices(servicesResult || []);

      // Load bank accounts
      const { data: bankAccountsResult, error: bankError } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (bankError) throw bankError;
      setBankAccounts(bankAccountsResult || []);

    } catch (error) {
      console.error("Error loading services data:", error);
      toast.error("Failed to load services data");
    } finally {
      setIsLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service =>
        formatPlatformName(service.platform).toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatServiceType(service.service_type).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by platform
    if (selectedPlatform !== "all") {
      filtered = filtered.filter(service => service.platform === selectedPlatform);
    }

    setFilteredServices(filtered);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setShowOrderForm(true);

    // Pre-fill form with service data
    setValue("service_id", service.id);
    setValue("platform", service.platform as any);
    setValue("service_type", service.service_type);
    setValue("quantity", service.min_quantity);
    setValue("quality_type", "high_quality");
    setValue("payment_method", userData && userData.wallet_balance > 0 ? "wallet" : "bank_transfer");
  };

  const onSubmit = async (data: ServiceOrderInput) => {
    if (!userData || !selectedService) return;

    // Validate quantity
    const quantityValidation = validateServiceQuantity(
      data.quantity,
      selectedService.min_quantity,
      selectedService.max_quantity
    );

    if (!quantityValidation.isValid) {
      toast.error(quantityValidation.error);
      return;
    }

    // Calculate total price
    const totalPrice = calculateServicePrice(data.quantity, selectedService.price_per_1k);

    // Check payment method requirements
    if (data.payment_method === "wallet") {
      const hasSufficientBalance = await checkSufficientBalance(userData.id, totalPrice);
      if (!hasSufficientBalance) {
        toast.error("Insufficient wallet balance. Please fund your wallet or choose bank transfer.");
        return;
      }
    } else if (data.payment_method === "bank_transfer" && !data.bank_account_id) {
      toast.error("Please select a bank account for payment.");
      return;
    }

    setIsOrdering(true);
    try {
      // Create the order
      const { data: orderResult, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userData.id,
          service_id: data.service_id,
          quantity: data.quantity,
          price_per_1k: selectedService.price_per_1k,
          total_price: totalPrice,
          status: data.payment_method === "wallet" ? "pending" : "awaiting_payment",
          link: data.link,
          quality_type: data.quality_type,
          payment_method: data.payment_method,
          bank_account_id: data.bank_account_id || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // If paying with wallet, deduct the amount
      if (data.payment_method === "wallet") {
        const deductResponse = await fetch("/api/wallet/deduct", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: totalPrice,
            orderId: orderResult.id,
            description: `Payment for ${formatPlatformName(selectedService.platform)} ${formatServiceType(selectedService.service_type)}`,
          }),
        });

        if (!deductResponse.ok) {
          const errorData = await deductResponse.json();
          throw new Error(errorData.error || "Failed to process wallet payment");
        }

        toast.success("Order placed successfully! Payment deducted from wallet.", {
          icon: <CheckCircle2 className="h-5 w-5" />,
        });
      } else {
        toast.success("Order created! Please make the payment to complete your order.", {
          icon: <CheckCircle2 className="h-5 w-5" />,
        });
      }

      // Reset form and close modal
      reset();
      setShowOrderForm(false);
      setSelectedService(null);

      // Redirect to orders page
      router.push("/dashboard/orders");

    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order", {
        description: error instanceof Error ? error.message : "Please try again",
        icon: <XCircle className="h-5 w-5" />,
      });
    } finally {
      setIsOrdering(false);
    }
  };

  const getUniquePlatforms = () => {
    const platforms = [...new Set(services.map(service => service.platform))];
    return platforms.sort();
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
      {userData && (
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
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <Select
                value={selectedPlatform}
                onValueChange={setSelectedPlatform}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">All Platforms</SelectItem>
                  {getUniquePlatforms().map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {formatPlatformName(platform)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No services found matching your criteria</p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {formatPlatformName(service.platform)}
                  </Badge>
                  <Badge variant="outline">
                    {formatCurrency(service.price_per_1k)}/1k
                  </Badge>
                </div>
                <CardTitle className="text-lg">
                  {formatServiceType(service.service_type)}
                </CardTitle>
                <CardDescription>
                  {service.description || `Get ${formatServiceType(service.service_type).toLowerCase()} for your ${formatPlatformName(service.platform)} content`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Min Quantity</p>
                    <p className="font-medium">{service.min_quantity.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Max Quantity</p>
                    <p className="font-medium">{service.max_quantity.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Delivery Time</p>
                    <p className="font-medium">{service.delivery_time}</p>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleServiceSelect(service)}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Order Now
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Order Form Modal */}
      {showOrderForm && selectedService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                Order {formatPlatformName(selectedService.platform)} {formatServiceType(selectedService.service_type)}
              </CardTitle>
              <CardDescription>
                Fill in the details for your order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="link">
                      {selectedService.service_type.includes('profile') ? 'Profile URL' :
                        selectedService.service_type.includes('video') ? 'Video URL' :
                          selectedService.service_type.includes('post') ? 'Post URL' : 'Content URL'}
                    </Label>
                    <Input
                      id="link"
                      type="url"
                      placeholder="https://..."
                      {...register("link")}
                      disabled={isOrdering}
                    />
                    {errors.link && (
                      <p className="text-sm text-destructive">
                        {errors.link.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min={selectedService.min_quantity}
                      max={selectedService.max_quantity}
                      {...register("quantity", { valueAsNumber: true })}
                      disabled={isOrdering}
                    />
                    {errors.quantity && (
                      <p className="text-sm text-destructive">
                        {errors.quantity.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Min: {selectedService.min_quantity.toLocaleString()} - Max: {selectedService.max_quantity.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quality_type">Quality</Label>
                    <Select
                      value={watch("quality_type") || "high_quality"}
                      onValueChange={(value) => setValue("quality_type", value as "high_quality" | "low_quality")}
                      disabled={isOrdering}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select quality" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        <SelectItem value="high_quality">High Quality</SelectItem>
                        <SelectItem value="low_quality">Low Quality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment_method">Payment Method</Label>
                    <Select
                      value={watchedPaymentMethod || (userData && userData.wallet_balance > 0 ? "wallet" : "bank_transfer")}
                      onValueChange={(value) => setValue("payment_method", value as "wallet" | "bank_transfer")}
                      disabled={isOrdering}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        {userData && userData.wallet_balance > 0 && (
                          <SelectItem value="wallet">
                            <div className="flex flex-col">
                              <span>Wallet</span>
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(userData.wallet_balance)}
                              </span>
                            </div>
                          </SelectItem>
                        )}
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {watchedPaymentMethod === "bank_transfer" && (
                  <div className="space-y-2">
                    <Label htmlFor="bank_account_id">Select Bank Account</Label>
                    <Select
                      value={watch("bank_account_id") || ""}
                      onValueChange={(value) => setValue("bank_account_id", value)}
                      disabled={isOrdering}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose bank account..." />
                      </SelectTrigger>
                      <SelectContent className="z-50">
                        {bankAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            <div className="flex flex-col">
                              <span className="truncate">
                                {account.bank_name} - {account.account_number}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
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
                )}

                {/* Price Display */}
                {watchedQuantity && (
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Price:</span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(calculateServicePrice(watchedQuantity, selectedService.price_per_1k))}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {watchedQuantity.toLocaleString()} × {formatCurrency(selectedService.price_per_1k)}/1k
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button type="submit" disabled={isOrdering} className="flex-1">
                    {isOrdering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Place Order
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowOrderForm(false);
                      setSelectedService(null);
                      reset();
                    }}
                    disabled={isOrdering}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}