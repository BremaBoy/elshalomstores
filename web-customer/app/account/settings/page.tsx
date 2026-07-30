"use client";

import { useState } from "react";
import { Shield, Bell, Lock, Trash2, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    sms: false,
  });

  const handlePasswordUpdate = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }

    setIsUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsUpdating(false);

    if (error) {
      setPasswordMsg({ type: "error", text: error.message });
    } else {
      setPasswordMsg({ type: "success", text: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "⚠️ Are you sure you want to delete your account? This action is irreversible and all your data will be permanently removed."
    );
    if (!confirmed) return;
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="space-y-8">
      {/* Password Section */}
      <div className="bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-xl space-y-8">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
          <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
              Change Password
            </h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Keep your account secure
            </p>
          </div>
        </div>

        <div className="space-y-5 max-w-lg">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPass ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 pr-12 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPass((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
              >
                {showNewPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 pr-12 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
              >
                {showConfirmPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {passwordMsg && (
            <div
              className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold ${
                passwordMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-red-50 text-red-600 border border-red-100"
              }`}
            >
              {passwordMsg.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              )}
              {passwordMsg.text}
            </div>
          )}

          <Button
            onClick={handlePasswordUpdate}
            disabled={isUpdating || !newPassword}
            className="h-14 px-10 text-[10px] font-black uppercase tracking-widest rounded-2xl"
          >
            {isUpdating ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-xl space-y-8">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
          <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">
              Notifications
            </h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Choose what you want to hear about
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {[
            { key: "orderUpdates", label: "Order Updates", desc: "Shipping, delivery and order status notifications" },
            { key: "promotions", label: "Promotions & Deals", desc: "Exclusive offers, discounts and seasonal sales" },
            { key: "newsletter", label: "Newsletter", desc: "Weekly product highlights and store news" },
            { key: "sms", label: "SMS Alerts", desc: "Important alerts sent to your phone number" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">{label}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                className={`relative h-7 w-12 rounded-full transition-all duration-300 flex-shrink-0 ${
                  notifications[key as keyof typeof notifications] ? "bg-primary" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 bg-white rounded-full shadow transition-all duration-300 ${
                    notifications[key as keyof typeof notifications] ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <Button className="h-12 px-8 text-[10px] font-black uppercase tracking-widest rounded-2xl">
          Save Preferences
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="bg-white p-8 md:p-12 rounded-[48px] border-2 border-red-100 space-y-8">
        <div className="flex items-center gap-4 pb-6 border-b border-red-50">
          <div className="h-12 w-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Shield className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight text-red-600">
              Danger Zone
            </h3>
            <p className="text-xs text-red-400 font-bold uppercase tracking-widest mt-0.5">
              Irreversible actions — proceed with caution
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 bg-red-50 rounded-3xl border border-red-100">
          <div>
            <p className="text-sm font-black text-red-700 uppercase tracking-wide mb-1">
              Delete Account
            </p>
            <p className="text-xs text-red-500 font-medium">
              Permanently remove your account and all associated data. This cannot be undone.
            </p>
          </div>
          <Button
            onClick={handleDeleteAccount}
            className="bg-red-500 hover:bg-red-600 text-white h-12 px-8 text-[10px] font-black uppercase tracking-widest rounded-2xl gap-2 flex-shrink-0 shadow-lg shadow-red-200"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
