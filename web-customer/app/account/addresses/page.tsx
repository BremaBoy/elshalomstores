"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Trash2, Home, Briefcase, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import {
  createSavedAddress,
  readSavedAddresses,
  type SavedAddress,
  writeSavedAddresses,
} from "@/lib/addressBook";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    label: "Home",
    name: "",
    street: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      const id = session?.user.id || null;
      setUserId(id);
      setAddresses(id ? readSavedAddresses(id) : []);
      setLoaded(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded || !userId) return;
    writeSavedAddresses(userId, addresses);
  }, [addresses, loaded, userId]);

  const handleDelete = (id: string) => {
    setAddresses((prev) => {
      const removed = prev.find((address) => address.id === id);
      const remaining = prev.filter((address) => address.id !== id);
      if (removed?.isDefault && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isDefault: true };
      }
      return remaining;
    });
  };

  const handleAdd = () => {
    if (!form.name || !form.street || !form.city || !form.state) return;
    setAddresses((prev) => [
      ...prev,
      createSavedAddress(form, prev.length === 0),
    ]);
    setForm({ label: "Home", name: "", street: "", city: "", state: "" });
    setShowForm(false);
  };

  return (
    <div className="bg-card text-text-primary p-8 md:p-12 rounded-[48px] border border-border shadow-xl min-h-[600px] space-y-10">
      <div className="flex justify-between items-center pb-6 border-b border-border">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight text-text-primary">
            Saved <span className="text-primary">Addresses</span>
          </h3>
          <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mt-1">
            {addresses.length} {addresses.length === 1 ? "address" : "addresses"} saved
          </p>
        </div>
        <Button
          onClick={() => setShowForm((v) => !v)}
          className="h-10 px-6 text-[10px] font-black uppercase tracking-widest rounded-2xl gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-bg p-8 rounded-[32px] border border-border space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <h4 className="text-sm font-black uppercase tracking-widest text-text-primary">New Address</h4>

          <div className="flex gap-4">
            {["Home", "Work", "Other"].map((type) => (
              <button
                key={type}
                onClick={() => setForm((f) => ({ ...f, label: type }))}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all ${
                  form.label === type
                    ? "bg-primary text-white border-primary"
                    : "bg-bg text-text-secondary border-border hover:border-primary/30"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { field: "name", label: "Full Name", placeholder: "John Doe" },
              { field: "street", label: "Street Address", placeholder: "14 Admiralty Way" },
              { field: "city", label: "City", placeholder: "Lagos" },
              { field: "state", label: "State", placeholder: "Lagos State" },
            ].map(({ field, label, placeholder }) => (
              <div key={field} className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
                  {label}
                </label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={form[field as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  className="w-full h-12 bg-bg text-text-primary border border-border rounded-2xl px-5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleAdd} className="h-12 px-8 text-[10px] font-black uppercase tracking-widest rounded-2xl">
              Save Address
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              className="h-12 px-8 text-[10px] font-black uppercase tracking-widest rounded-2xl"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Address Cards */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-20 space-y-6">
            <div className="h-24 w-24 bg-bg rounded-full flex items-center justify-center mx-auto">
              <MapPin className="h-12 w-12 text-primary/30" />
            </div>
            <div>
              <h4 className="text-lg font-black text-text-secondary uppercase tracking-widest">
                No addresses saved
              </h4>
              <p className="text-text-secondary text-sm mt-2 font-medium">
                Add a delivery address for faster checkout.
              </p>
            </div>
          </div>
        ) : (
          addresses.map((addr) => {
            const AddressIcon = addr.label === "Work" ? Briefcase : Home;
            return (
              <div
                key={addr.id}
                className={`flex items-start justify-between p-6 rounded-3xl border-2 transition-all ${
                  addr.isDefault
                    ? "border-primary/20 bg-primary/5"
                    : "border-border bg-bg hover:border-primary/30"
                }`}
              >
                <div className="flex items-start gap-5">
                  <div className="h-12 w-12 bg-bg rounded-2xl flex items-center justify-center shadow-sm border border-border flex-shrink-0">
                    <AddressIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-black uppercase tracking-wider text-text-primary">
                        {addr.label}
                      </p>
                      {addr.isDefault && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-text-primary">{addr.name}</p>
                    <p className="text-sm text-text-secondary font-medium">
                      {addr.street}, {addr.city}, {addr.state}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 text-text-secondary/60 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    aria-label={`Delete ${addr.label} address`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
