"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { CreditCard, Truck, ShieldCheck, User, ChevronRight, CheckCircle2, Loader2, Plus, Home, Briefcase } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  createSavedAddress,
  readSavedAddresses,
  type SavedAddress,
  writeSavedAddresses,
} from "@/lib/addressBook";

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState("Home");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    paymentMethod: "paystack"
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});



  useEffect(() => {
    setMounted(true);
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login?redirect=/checkout");
      } else {
        const fullName = session.user.user_metadata?.full_name || "";
        const addresses = readSavedAddresses(session.user.id);
        const preferredAddress = addresses.find((address) => address.isDefault) || addresses[0];
        const [addressFirstName, ...addressRemainingNames] = preferredAddress?.name.split(" ").filter(Boolean) || [];

        setUserId(session.user.id);
        setSavedAddresses(addresses);
        setSelectedAddressId(preferredAddress?.id || null);
        setShowNewAddressForm(addresses.length === 0);
        setFormData(prev => ({
          ...prev,
          email: session.user.email || prev.email,
          firstName: addressFirstName || fullName.split(' ')[0] || prev.firstName,
          lastName: addressRemainingNames.join(" ") || fullName.split(' ').slice(1).join(' ') || prev.lastName,
          phone: session.user.phone || session.user.user_metadata?.phone || prev.phone,
          address: preferredAddress?.street || prev.address,
          city: preferredAddress?.city || prev.city,
          state: preferredAddress?.state || prev.state,
        }));
        setIsAuthenticated(true);
        setStep(2);
        setIsLoadingAddresses(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, boolean> = {};
    
    if (stepNumber === 1) {
      if (!formData.firstName) newErrors.firstName = true;
      if (!formData.lastName) newErrors.lastName = true;
      if (!formData.email) newErrors.email = true;
      if (!formData.phone) newErrors.phone = true;
    } else if (stepNumber === 2) {
      if (!formData.address) newErrors.address = true;
      if (!formData.city) newErrors.city = true;
      if (!formData.state) newErrors.state = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    } else {
      alert("Please fill in all mandatory fields before continuing.");
    }
  };

  const selectSavedAddress = (address: SavedAddress) => {
    const [firstName, ...remainingNames] = address.name.split(" ").filter(Boolean);
    setSelectedAddressId(address.id);
    setShowNewAddressForm(false);
    setFormData((prev) => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: remainingNames.join(" ") || prev.lastName,
      address: address.street,
      city: address.city,
      state: address.state,
    }));
    setErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors.address;
      delete nextErrors.city;
      delete nextErrors.state;
      return nextErrors;
    });
  };

  const startAddingAddress = () => {
    setSelectedAddressId(null);
    setShowNewAddressForm(true);
    setFormData((prev) => ({
      ...prev,
      address: "",
      city: "",
      state: "",
    }));
  };

  const cancelAddingAddress = () => {
    const preferredAddress = savedAddresses.find((address) => address.isDefault) || savedAddresses[0];
    if (preferredAddress) selectSavedAddress(preferredAddress);
  };

  const continueToPayment = () => {
    if (!validateStep(2)) {
      alert("Please complete the delivery address before continuing.");
      return;
    }

    if (showNewAddressForm) {
      if (!userId) {
        alert("Please sign in again before saving this address.");
        return;
      }

      const newAddress = createSavedAddress(
        {
          label: newAddressLabel,
          name: `${formData.firstName} ${formData.lastName}`.trim() || formData.email,
          street: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
        },
        savedAddresses.length === 0,
      );
      const nextAddresses = [...savedAddresses, newAddress];
      setSavedAddresses(nextAddresses);
      setSelectedAddressId(newAddress.id);
      setShowNewAddressForm(false);
      writeSavedAddresses(userId, nextAddresses);
    } else if (!selectedAddressId) {
      alert("Please select a delivery address.");
      return;
    }

    setStep(3);
  };

  const handleCompleteOrder = async () => {
    setIsSubmitting(true);
    try {
      const orderData = {
        items,
        payment_method: formData.paymentMethod,
        shipping_details: {
          ...formData,
          savedAddressId: selectedAddressId,
        },
        delivery_instructions: "", // Optional
        shipping_cost: 0, // Free as per UI
      };
      
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Your session expired. Please sign in again.");

      // 1. Create the order through this deployed Next.js application.
      const orderResponse = await axios.post(
        "/api/orders",
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!orderResponse.data || !orderResponse.data.success) {
        throw new Error(orderResponse.data?.message || "Failed to create order");
      }

      const insertedOrder = orderResponse.data.data;
      
      // 2. If paystack or flutterwave, initialize payment and redirect
      if (formData.paymentMethod !== 'cod') {
        const payload = {
          order_id: insertedOrder.id
        };

        const response = await axios.post(
          `/api/payments/${formData.paymentMethod}/initialize`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        const authorizationUrl = response.data?.data?.authorization_url;
        if (authorizationUrl) {
          // Keep the cart until the gateway confirms payment. This lets the
          // customer retry without rebuilding it after a cancellation/failure.
          window.location.href = authorizationUrl;
          return;
        } else {
           throw new Error("Failed to get payment authorization URL");
        }
      }
      
      setIsSuccess(true);
      clearCart();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Order submission error:", error);
      const errorMessage = error.response?.data?.message
        || error.message
        || "The order could not be completed. Please try again.";
      alert(`Failed to place order\n\n${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-bg text-text-primary">
        <Header />
        <Container className="pt-40 pb-20 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-700">
          <div className="h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tighter text-text-primary">Order Confirmed!</h1>
            <p className="text-xl text-text-secondary max-w-lg mx-auto leading-relaxed">
              Thank you for your purchase. Your order has been placed successfully and we&apos;ll notify you when it ships.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <Link href="/profile">
              <Button className="h-16 px-12 text-lg rounded-2xl font-extrabold uppercase tracking-widest shadow-xl shadow-primary/20">Track My Order</Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline" className="h-16 px-12 text-lg rounded-2xl font-extrabold uppercase tracking-widest border-slate-200">Continue Shopping</Button>
            </Link>
          </div>
        </Container>
        <Footer />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen">
        <Header />
        <Container className="pt-32 pb-20 text-center">
          <SectionTitle title="Checkout" subtitle="Your cart is empty. Please add items before checking out." />
          <Link href="/shop">
            <Button>Return to Shop</Button>
          </Link>
        </Container>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <Header />
      <div className="pt-32 pb-20">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12 bg-card p-6 rounded-[32px] border border-border shadow-sm overflow-x-auto gap-8">
              {[
                { id: 1, name: isAuthenticated ? "Account" : "Contact", icon: User },
                { id: 2, name: "Shipping", icon: Truck },
                { id: 3, name: "Payment", icon: CreditCard },
              ].map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s.id ? "bg-primary text-white" : "bg-bg text-text-secondary"}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className={`text-sm font-extrabold uppercase tracking-widest ${step >= s.id ? "text-text-primary" : "text-text-secondary"}`}>
                    {s.name}
                  </span>
                  {s.id < 3 && <ChevronRight className="h-4 w-4 text-text-secondary/40 hidden sm:block" />}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              <div className="lg:col-span-3 space-y-8">
                {/* Step 1: Contact Info */}
                {step === 1 && (
                  <div className="bg-card p-8 md:p-12 rounded-[40px] border border-border shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-2xl font-extrabold uppercase tracking-tight">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">First Name</label>
                        <input name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" placeholder="John" className={`w-full h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 outline-none focus:ring-2 transition-all font-medium ${errors.firstName ? 'ring-2 ring-red-500/50' : 'focus:ring-primary/20'}`} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Last Name</label>
                        <input name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" placeholder="Doe" className={`w-full h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 outline-none focus:ring-2 transition-all font-medium ${errors.lastName ? 'ring-2 ring-red-500/50' : 'focus:ring-primary/20'}`} />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</label>
                        <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="john@example.com" className={`w-full h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 outline-none focus:ring-2 transition-all font-medium ${errors.email ? 'ring-2 ring-red-500/50' : 'focus:ring-primary/20'}`} />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone Number</label>
                        <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="+234 800 000 0000" className={`w-full h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 outline-none focus:ring-2 transition-all font-medium ${errors.phone ? 'ring-2 ring-red-500/50' : 'focus:ring-primary/20'}`} />
                      </div>
                    </div>
                    <Button onClick={nextStep} className="w-full h-16 text-xl rounded-2xl font-extrabold uppercase tracking-widest">
                      Continue to Shipping
                    </Button>
                  </div>
                )}

                {/* Step 2: Shipping */}
                {step === 2 && (
                  <div className="bg-card p-8 md:p-12 rounded-[40px] border border-border shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h3 className="text-2xl font-extrabold uppercase tracking-tight">
                          {showNewAddressForm ? "Add a delivery address" : "Choose a delivery address"}
                        </h3>
                        <p className="mt-2 text-sm text-text-secondary">
                          {showNewAddressForm
                            ? "This address will also be saved in your account."
                            : "Select one of the addresses already saved in your account."}
                        </p>
                      </div>
                      {!showNewAddressForm && savedAddresses.length > 0 && (
                        <button
                          type="button"
                          onClick={startAddingAddress}
                          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary transition hover:text-primary-hover"
                        >
                          <Plus className="h-4 w-4" /> Add new address
                        </button>
                      )}
                    </div>

                    {isLoadingAddresses ? (
                      <div className="flex min-h-48 items-center justify-center rounded-3xl border border-dashed border-border">
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        {!showNewAddressForm && savedAddresses.length > 0 && (
                          <div className="grid grid-cols-1 gap-4">
                            {savedAddresses.map((address) => {
                              const AddressIcon = address.label === "Work" ? Briefcase : Home;
                              const selected = selectedAddressId === address.id;

                              return (
                                <button
                                  key={address.id}
                                  type="button"
                                  onClick={() => selectSavedAddress(address)}
                                  className={`flex w-full items-start gap-4 rounded-3xl border-2 p-5 text-left transition-all ${
                                    selected
                                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                                      : "border-border bg-bg hover:border-primary/30"
                                  }`}
                                >
                                  <span className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${selected ? "bg-primary text-white" : "bg-card text-primary"}`}>
                                    <AddressIcon className="h-5 w-5" />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="flex flex-wrap items-center gap-2">
                                      <span className="text-xs font-black uppercase tracking-widest text-text-primary">{address.label}</span>
                                      {address.isDefault && (
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-primary">
                                          Default
                                        </span>
                                      )}
                                    </span>
                                    <span className="mt-1 block text-sm font-bold text-text-primary">{address.name}</span>
                                    <span className="mt-1 block text-sm leading-6 text-text-secondary">
                                      {address.street}, {address.city}, {address.state}
                                    </span>
                                  </span>
                                  <span className={`mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${selected ? "border-primary bg-primary" : "border-border"}`}>
                                    {selected && <CheckCircle2 className="h-4 w-4 text-white" />}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {showNewAddressForm && (
                          <div className="space-y-6 rounded-3xl border border-border bg-bg p-6">
                            <div className="space-y-3">
                              <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Address label</label>
                              <div className="flex flex-wrap gap-3">
                                {["Home", "Work", "Other"].map((label) => (
                                  <button
                                    key={label}
                                    type="button"
                                    onClick={() => setNewAddressLabel(label)}
                                    className={`rounded-xl border px-5 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                                      newAddressLabel === label
                                        ? "border-primary bg-primary text-white"
                                        : "border-border bg-card text-text-secondary hover:border-primary/30"
                                    }`}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">Street Address</label>
                              <input name="address" value={formData.address} onChange={handleInputChange} type="text" placeholder="House No, Street Name" className={`w-full h-14 bg-card border border-border rounded-2xl px-6 text-text-primary placeholder:text-text-secondary/60 outline-none focus:ring-2 transition-all font-medium ${errors.address ? 'ring-2 ring-red-500/50' : 'focus:border-primary focus:ring-primary/20'}`} />
                            </div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">City</label>
                                <input name="city" value={formData.city} onChange={handleInputChange} type="text" placeholder="Lagos" className={`w-full h-14 bg-card border border-border rounded-2xl px-6 text-text-primary placeholder:text-text-secondary/60 outline-none focus:ring-2 transition-all font-medium ${errors.city ? 'ring-2 ring-red-500/50' : 'focus:border-primary focus:ring-primary/20'}`} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-text-secondary">State</label>
                                <input name="state" value={formData.state} onChange={handleInputChange} type="text" placeholder="Lagos State" className={`w-full h-14 bg-card border border-border rounded-2xl px-6 text-text-primary placeholder:text-text-secondary/60 outline-none focus:ring-2 transition-all font-medium ${errors.state ? 'ring-2 ring-red-500/50' : 'focus:border-primary focus:ring-primary/20'}`} />
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex flex-col gap-4 sm:flex-row">
                      {!isAuthenticated && <Button variant="outline" onClick={() => setStep(1)} className="h-16 px-8 rounded-2xl font-bold uppercase tracking-widest">Back</Button>}
                      {showNewAddressForm && savedAddresses.length > 0 && (
                        <Button variant="outline" onClick={cancelAddingAddress} className="h-16 px-8 rounded-2xl font-bold uppercase tracking-widest">
                          Cancel
                        </Button>
                      )}
                      <Button
                        onClick={continueToPayment}
                        disabled={isLoadingAddresses}
                        className="flex-grow h-16 text-lg rounded-2xl font-extrabold uppercase tracking-widest"
                      >
                        {showNewAddressForm ? "Save Address & Continue" : "Continue to Payment"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <div className="bg-card p-8 md:p-12 rounded-[40px] border border-border shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-2xl font-extrabold uppercase tracking-tight">Payment Method</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-4">
                        <label 
                          className={`flex items-center justify-between p-6 border-2 rounded-[32px] cursor-pointer transition-all ${formData.paymentMethod === 'paystack' ? 'border-primary bg-primary/5' : 'border-border'}`}
                          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'paystack' }))}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center p-1 ${formData.paymentMethod === 'paystack' ? 'border-primary' : 'border-slate-300'}`}>
                              {formData.paymentMethod === 'paystack' && <div className="h-full w-full bg-primary rounded-full" />}
                            </div>
                            <span className={`font-bold ${formData.paymentMethod === 'paystack' ? 'text-text-primary' : 'text-text-secondary'}`}>Paystack / Online Payment</span>
                          </div>
                          <div className="flex gap-2 text-primary font-bold text-xs">
                            {["VISA", "MC", "VERVE"].map(v => <span key={v} className="bg-bg px-2 py-0.5 rounded border border-primary/20">{v}</span>)}
                          </div>
                        </label>
                        
                        {formData.paymentMethod === 'paystack' && (
                          <p className="px-2 text-xs text-text-secondary">
                            You&apos;ll enter payment details securely on Paystack.
                          </p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <label 
                          className={`flex items-center justify-between p-6 border-2 rounded-[32px] cursor-pointer transition-all ${formData.paymentMethod === 'flutterwave' ? 'border-primary bg-primary/5' : 'border-border'}`}
                          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'flutterwave' }))}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center p-1 ${formData.paymentMethod === 'flutterwave' ? 'border-primary' : 'border-slate-300'}`}>
                              {formData.paymentMethod === 'flutterwave' && <div className="h-full w-full bg-primary rounded-full" />}
                            </div>
                            <span className={`font-bold ${formData.paymentMethod === 'flutterwave' ? 'text-text-primary' : 'text-text-secondary'}`}>Flutterwave / Online Payment</span>
                          </div>
                          <div className="flex gap-2 text-primary font-bold text-xs uppercase">
                            <span className="bg-bg px-2 py-0.5 rounded border border-primary/20">FLW</span>
                          </div>
                        </label>
                        
                        {formData.paymentMethod === 'flutterwave' && (
                          <p className="px-2 text-xs text-text-secondary">
                            You&apos;ll enter payment details securely on Flutterwave.
                          </p>
                        )}
                      </div>
                      <label 
                        className={`flex items-center justify-between p-6 border-2 rounded-[32px] cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border'}`}
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cod' }))}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center p-1 ${formData.paymentMethod === 'cod' ? 'border-primary' : 'border-slate-300'}`}>
                            {formData.paymentMethod === 'cod' && <div className="h-full w-full bg-primary rounded-full" />}
                          </div>
                          <span className={`font-bold ${formData.paymentMethod === 'cod' ? 'text-text-primary' : 'text-text-secondary'}`}>Cash on Delivery</span>
                        </div>
                      </label>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Button variant="outline" onClick={() => setStep(2)} className="h-16 px-8 rounded-2xl font-bold uppercase tracking-widest">Back</Button>
                      <Button disabled={isSubmitting} onClick={handleCompleteOrder} className="flex-grow h-16 text-xl rounded-2xl font-extrabold uppercase tracking-widest shadow-lg shadow-primary/20">
                        {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Complete Order"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2">
                <div className="bg-slate-900 text-white p-8 md:p-10 rounded-[48px] shadow-2xl space-y-8 sticky top-32">
                  <h4 className="text-xl font-bold uppercase tracking-widest text-primary">Your Order</h4>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center group">
                        <div className="relative h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                          <Image src={item.image} alt={item.name} fill className="object-cover opacity-80" />
                          <span className="absolute top-0 right-0 h-5 w-5 bg-primary text-[10px] flex items-center justify-center rounded-bl-lg font-bold">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-bold line-clamp-1">{item.name}</p>
                          <p className="text-xs text-slate-500 font-medium">₦{(item.discountPrice || item.price).toLocaleString()} / each</p>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          ₦{((item.discountPrice || item.price) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-slate-800 space-y-4">
                    <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                      <span>Subtotal</span>
                      <span className="text-white">₦{getTotalPrice().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                      <span>Shipping</span>
                      <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest border border-emerald-400/20 px-2 py-0.5 rounded-full">Free</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-extrabold">
                      <span>Total</span>
                      <span className="text-primary text-3xl">₦{getTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-3xl bg-slate-800/50 border border-slate-700/50 flex gap-4">
                    <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-relaxed">
                      Secure checkout. Your data is protected by industry standard encryption.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
}
