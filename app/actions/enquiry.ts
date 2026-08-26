"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(2, "Please tell us your name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  service: z.string().trim().max(120).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please give us a little more detail.").max(4000),
  // Honeypot: real people leave this empty, most bots fill it in.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type EnquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function submitEnquiry(
  _prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    company: formData.get("company"),
    service: formData.get("service"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    website: formData.get("website"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }

  const { website, ...data } = parsed.data;
  if (website) {
    // Silently accept so the bot does not learn it was caught.
    return { status: "success", message: "Thank you — we will be in touch shortly." };
  }

  try {
    await prisma.enquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        service: data.service || null,
        subject: data.subject || null,
        message: data.message,
      },
    });
  } catch {
    return {
      status: "error",
      message: "We could not save your message. Please call us instead.",
    };
  }

  return {
    status: "success",
    message:
      "Thank you — your enquiry is with our team. We reply to quotation requests within one working day.",
  };
}
