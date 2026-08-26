"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { submitEnquiry, type EnquiryState } from "@/app/actions/enquiry";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { services } from "@/lib/site";
import { cn } from "@/lib/utils";

const initial: EnquiryState = { status: "idle" };

export function ContactForm() {
  const [state, action] = useActionState(submitEnquiry, initial);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-sm border border-signal/25 bg-signal-soft p-8">
        <CheckCircle2 className="h-7 w-7 text-signal" />
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Message received</h2>
          <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-ink-3">
            {state.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state.status === "error" && (
        <div
          role="alert"
          className="flex gap-2.5 rounded-sm border border-alert/25 bg-alert-soft p-3.5 text-[0.8125rem] text-alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
          <span>{state.message}</span>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name" required>
          <input id="name" name="name" required autoComplete="name" className={inputClass} />
        </Field>
        <Field label="Company" htmlFor="company">
          <input id="company" name="company" autoComplete="organization" className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email address" htmlFor="email" required>
          <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
        </Field>
        <Field label="Phone number" htmlFor="phone">
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
        </Field>
      </div>

      <Field label="What is this about?" htmlFor="service">
        <select id="service" name="service" defaultValue="" className={inputClass}>
          <option value="">General enquiry</option>
          {services.map((s) => (
            <option key={s.slug} value={s.name}>
              {s.name}
            </option>
          ))}
          <option value="Online order support">Online order support</option>
        </select>
      </Field>

      <Field label="Subject" htmlFor="subject">
        <input
          id="subject"
          name="subject"
          placeholder="e.g. Monthly AGO supply for two sites"
          className={inputClass}
        />
      </Field>

      <Field
        label="Message"
        htmlFor="message"
        required
        hint="Quantities, locations and timelines help us quote accurately first time."
      >
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className={cn(inputClass, "h-auto py-2.5")}
        />
      </Field>

      {/* Honeypot — hidden from people, tempting to bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor="website">Leave this empty</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto sm:min-w-56">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Sending…
        </>
      ) : (
        <>
          <Send className="h-4 w-4" /> Send enquiry
        </>
      )}
    </Button>
  );
}
