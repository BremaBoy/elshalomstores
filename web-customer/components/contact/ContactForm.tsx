"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const subject = String(form.get("subject") || "");
    const message = String(form.get("message") || "");
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    setStatus("Your email app is opening. Review the message there, then press Send.");
    window.location.href = `mailto:support@elshalomstores.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <label className="space-y-2">
        <span className="block text-xs font-bold uppercase tracking-widest text-text-secondary">Your Name</span>
        <input required name="name" type="text" placeholder="Full Name" className="h-14 w-full rounded-2xl border border-border bg-bg px-6 font-medium text-text-primary outline-none placeholder:text-text-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/20" />
      </label>
      <label className="space-y-2">
        <span className="block text-xs font-bold uppercase tracking-widest text-text-secondary">Email Address</span>
        <input required name="email" type="email" placeholder="email@example.com" className="h-14 w-full rounded-2xl border border-border bg-bg px-6 font-medium text-text-primary outline-none placeholder:text-text-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/20" />
      </label>
      <label className="space-y-2 md:col-span-2">
        <span className="block text-xs font-bold uppercase tracking-widest text-text-secondary">Subject</span>
        <input required name="subject" type="text" defaultValue={searchParams.get("subject") || ""} placeholder="How can we help?" className="h-14 w-full rounded-2xl border border-border bg-bg px-6 font-medium text-text-primary outline-none placeholder:text-text-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/20" />
      </label>
      <label className="space-y-2 md:col-span-2">
        <span className="block text-xs font-bold uppercase tracking-widest text-text-secondary">Message</span>
        <textarea required name="message" rows={5} placeholder="Tell us more about your inquiry..." className="w-full resize-none rounded-[28px] border border-border bg-bg p-6 font-medium text-text-primary outline-none placeholder:text-text-secondary/60 focus:border-primary focus:ring-2 focus:ring-primary/20" />
      </label>
      <div className="md:col-span-2">
        {status && <p role="status" className="mb-4 text-sm font-medium text-text-secondary">{status}</p>}
        <Button className="h-16 w-full gap-3 rounded-2xl text-lg font-extrabold uppercase tracking-widest">
          Open Email App
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}
