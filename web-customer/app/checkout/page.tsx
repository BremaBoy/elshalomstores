"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cartStore";
import { CreditCard, Truck, ShieldCheck, Mail, MapPin, User, ChevronRight, CheckCircle2, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
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
    paymentMethod: "paystack",
    cardNumber: "",
    expiryDate: "",
    cvv: ""
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login?redirect=/checkout");
      } else {
        setUser(session.user);
        // Pre-fill email and name if available
        setFormData(prev => ({
          ...prev,
          email: session.user.email || prev.email,
          firstName: session.user.user_metadata?.full_name?.split(' ')[0] || prev.firstName,
          lastName: session.user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || prev.lastName,
        }));
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
    } else if (stepNumber === 3) {
      if (formData.paymentMethod === 'paystack' || formData.paymentMethod === 'flutterwave') {
        if (!formData.cardNumber) newErrors.cardNumber = true;
        if (!formData.expiryDate) newErrors.expiryDate = true;
        if (!formData.cvv) newErrors.cvv = true;
      }
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

  const handleCompleteOrder = async () => {
    if (!validateStep(3)) {
      alert("Please fill in all mandatory fields before completing your order.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const orderData = {
        items,
        payment_method: formData.paymentMethod,
        shipping_details: formData,
        delivery_instructions: "", // Optional
        shipping_cost: 0, // Free as per UI
      };
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // 1. Create order via Backend API
      const orderResponse = await axios.post(
        `${apiUrl}/api/orders`, 
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
          email: formData.email || user?.email,
          amount: getTotalPrice(),
          order_id: insertedOrder.id
        };

        const response = await axios.post(
          `${apiUrl}/api/payments/${formData.paymentMethod}/initialize`, 
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.data && response.data.authorization_url) {
          // Clear cart before redirecting to be safe
          clearCart();
          window.location.href = response.data.authorization_url;
          return;
        } else {
           throw new Error("Failed to get payment authorization URL");
        }
      }
      
      setIsSuccess(true);
      clearCart();
    } catch (error: any) {
      console.error("DEBUG: Order submission full error:", error);
      
      // Robust error extraction for Supabase/Axios
      const errorMessage = error.message || error.error_description || "Unknown Error";
      const errorDetail = error.details || error.hint || "";
      const statusCode = error.code || error.status || "N/A";
      
      console.log(`Order Error Details: [Code: ${statusCode}] ${errorMessage} - ${errorDetail}`);
      
      alert(`🚨 FAILED TO PLACE ORDER\n\nError: ${errorMessage}\nDetails: ${errorDetail}\nCode: ${statusCode}\n\nTIP: If you see "relation 'orders' does not exist", please run the SQL schema in your Supabase SQL Editor.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950">
        <Header />
        <Container className="pt-40 pb-20 flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in-95 duration-700">
          <div className="h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tighter text-slate-900 dark:text-white">Order Confirmed!</h1>
            <p className="text-xl text-slate-500 max-w-lg mx-auto leading-relaxed">
              Thank you for your purchase. Your order has been placed successfully and we'll notify you when it ships.
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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900/30">
      <Header />
      <div className="pt-32 pb-20">
        <Container>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-12 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto gap-8">
              {[
                { id: 1, name: "Contact", icon: User },
                { id: 2, name: "Shipping", icon: Truck },
                { id: 3, name: "Payment", icon: CreditCard },
              ].map((s) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s.id ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className={`text-sm font-extrabold uppercase tracking-widest ${step >= s.id ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>
                    {s.name}
                  </span>
                  {s.id < 3 && <ChevronRight className="h-4 w-4 text-slate-300 hidden sm:block" />}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              <div className="lg:col-span-3 space-y-8">
                {/* Step 1: Contact Info */}
                {step === 1 && (
                  <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                  <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-2xl font-extrabold uppercase tracking-tight">Shipping Details</h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Street Address</label>
                        <input name="address" value={formData.address} onChange={handleInputChange} type="text" placeholder="House No, Street Name" className={`w-full h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 outline-none focus:ring-2 transition-all font-medium ${errors.address ? 'ring-2 ring-red-500/50' : 'focus:ring-primary/20'}`} />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">City</label>
                          <input name="city" value={formData.city} onChange={handleInputChange} type="text" placeholder="Lagos" className={`w-full h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 outline-none focus:ring-2 transition-all font-medium ${errors.city ? 'ring-2 ring-red-500/50' : 'focus:ring-primary/20'}`} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">State</label>
                          <input name="state" value={formData.state} onChange={handleInputChange} type="text" placeholder="Lagos State" className={`w-full h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 outline-none focus:ring-2 transition-all font-medium ${errors.state ? 'ring-2 ring-red-500/50' : 'focus:ring-primary/20'}`} />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep(1)} className="h-16 px-8 rounded-2xl font-bold uppercase tracking-widest">Back</Button>
                      <Button onClick={nextStep} className="flex-grow h-16 text-xl rounded-2xl font-extrabold uppercase tracking-widest">Continue to Payment</Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                  <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-2xl font-extrabold uppercase tracking-tight">Payment Method</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-4">
                        <label 
                          className={`flex items-center justify-between p-6 border-2 rounded-[32px] cursor-pointer transition-all ${formData.paymentMethod === 'paystack' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800'}`}
                          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'paystack' }))}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center p-1 ${formData.paymentMethod === 'paystack' ? 'border-primary' : 'border-slate-300'}`}>
                              {formData.paymentMethod === 'paystack' && <div className="h-full w-full bg-primary rounded-full" />}
                            </div>
                            <span className={`font-bold ${formData.paymentMethod === 'paystack' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Paystack / Online Payment</span>
                          </div>
                          <div className="flex gap-2 text-primary font-bold text-xs">
                            {["VISA", "MC", "VERVE"].map(v => <span key={v} className="bg-white px-2 py-0.5 rounded border border-primary/20">{v}</span>)}
                          </div>
                        </label>
                        
                        {/* Card Form Dropdown (Paystack) */}
                        {formData.paymentMethod === 'paystack' && (
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300 space-y-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-left block">Card Number (Paystack)</label>
                              <div className="relative">
                                <input name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} type="text" placeholder="4084 0840 8408 4081" className={`w-full h-12 bg-white dark:bg-slate-900 border-none rounded-xl px-4 outline-none focus:ring-2 transition-all font-mono ${errors.cardNumber ? 'ring-2 ring-red-500/50' : 'focus:ring-primary/20'}`} />
                                <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-left block">Expiry Date</label>
                                <input name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} type="text" placeholder="01 / 28" className={`w-full h-12 bg-white dark:bg-slate-900 border-none rounded-xl px-4 outline-none focus:ring-2 transition-all font-mono ${errors.expiryDate ? 'ring-2 ring-red-500/50' : 'focus:ring-primary/20'}`} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-left block">CVV</label>
                                <input name="cvv" value={formData.cvv} onChange={handleInputChange} type="text" placeholder="123" className={`w-full h-12 bg-white dark:bg-slate-900 border-none rounded-xl px-4 outline-none focus:ring-2 transition-all font-mono ${errors.cvv ? 'ring-2 ring-red-500/50' : 'focus:ring-primary/20'}`} />
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-2">
                              <Lock className="h-3 w-3" />
                              Secure Paystack encryption enabled.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <label 
                          className={`flex items-center justify-between p-6 border-2 rounded-[32px] cursor-pointer transition-all ${formData.paymentMethod === 'flutterwave' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800'}`}
                          onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'flutterwave' }))}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center p-1 ${formData.paymentMethod === 'flutterwave' ? 'border-primary' : 'border-slate-300'}`}>
                              {formData.paymentMethod === 'flutterwave' && <div className="h-full w-full bg-primary rounded-full" />}
                            </div>
                            <span className={`font-bold ${formData.paymentMethod === 'flutterwave' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Flutterwave / Online Payment</span>
                          </div>
                          <div className="flex gap-2 text-primary font-bold text-xs uppercase">
                            <span className="bg-white px-2 py-0.5 rounded border border-primary/20">FLW</span>
                          </div>
                        </label>
                        
                        {/* Card Form Dropdown (Flutterwave) */}
                        {formData.paymentMethod === 'flutterwave' && (
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300 space-y-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-left block">Card Number (Flutterwave)</label>
                              <div className="relative">
                                <input name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} type="text" placeholder="4242 4242 4242 4242" className={`w-full h-12 bg-white dark:bg-slate-900 border-none rounded-xl px-4 outline-none focus:ring-2 transition-all font-mono ${errors.cardNumber ? 'ring-2 ring-red-500/50' : 'focus:ring-primary/20'}`} />
                                <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-500" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-left block">Expiry Date</label>
                                <input name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} type="text" placeholder="09 / 25" className={`w-full h-12 bg-white dark:bg-slate-900 border-none rounded-xl px-4 outline-none focus:ring-2 transition-all font-mono ${errors.expiryDate ? 'ring-2 ring-red-500/50' : 'focus:ring-primary/20'}`} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 text-left block">CVV</label>
                                <input name="cvv" value={formData.cvv} onChange={handleInputChange} type="text" placeholder="123" className={`w-full h-12 bg-white dark:bg-slate-900 border-none rounded-xl px-4 outline-none focus:ring-2 transition-all font-mono ${errors.cvv ? 'ring-2 ring-red-500/50' : 'focus:ring-primary/20'}`} />
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-2">
                              <Lock className="h-3 w-3" />
                              Secure Flutterwave protection active.
                            </p>
                          </div>
                        )}
                      </div>
                      <label 
                        className={`flex items-center justify-between p-6 border-2 rounded-[32px] cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800'}`}
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'cod' }))}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center p-1 ${formData.paymentMethod === 'cod' ? 'border-primary' : 'border-slate-300'}`}>
                            {formData.paymentMethod === 'cod' && <div className="h-full w-full bg-primary rounded-full" />}
                          </div>
                          <span className={`font-bold ${formData.paymentMethod === 'cod' ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Cash on Delivery</span>
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
