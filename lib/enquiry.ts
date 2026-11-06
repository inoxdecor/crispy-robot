export const ENQUIRY_SERVICES = [
  { slug: "websites", label: "Custom Website Development" },
  { slug: "mobile-apps", label: "Mobile Application Development" },
  { slug: "custom-software", label: "Custom Software Solutions" },
  { slug: "ai-automation", label: "AI Integration & Automation" },
  { slug: "ecommerce", label: "E-Commerce Development" },
  { slug: "ui-ux-design", label: "UI/UX & Digital Product Design" },
  { slug: "brand-identity", label: "Brand Identity & Creative Design" },
  { slug: "ai-visuals", label: "AI Visuals & Promotional Content" },
  { slug: "seo-support", label: "SEO, Optimization & Ongoing Support" },
] as const;

export const BUSINESS_EMAIL = "thebenzzcreationsofficial@gmail.com";
// Public access key published on the existing business website; this is not a secret.
export const WEB3FORMS_PUBLIC_ACCESS_KEY =
  process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ||
  "5e994371-51b9-4483-b052-b1cc21c34e8b";
export const WEB3FORMS_SUBJECT = "New project enquiry — TheBenzzCreations";
export const MAX_ENQUIRY_BYTES = 16_384;

export type EnquiryPayload = {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  message: string;
  timeline: string;
  website: string;
  consent: boolean;
};

export type EnquiryErrors = Partial<Record<keyof EnquiryPayload, string>>;
type ValidationResult =
  | { valid: true; data: EnquiryPayload }
  | { valid: false; errors: EnquiryErrors };

export function resolveService(value: string = ""): string {
  const match = ENQUIRY_SERVICES.find(
    (service) => service.slug === value || service.label === value,
  );
  if (match) return match.slug;
  const packages: Record<string, string> = {
    "essential-presence": "websites",
    "signature-digital-experience": "websites",
    "custom-product-engineering": "custom-software",
    "ongoing-partnership": "seo-support",
  };
  return packages[value] ?? "";
}

export function validateEnquiry(input: unknown): ValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      valid: false,
      errors: { message: "Please complete the enquiry form." },
    };
  }
  const raw = input as Record<string, unknown>;
  const errors: EnquiryErrors = {};
  const data: EnquiryPayload = {
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    budget: "",
    message: "",
    timeline: "",
    website: "",
    consent: raw.consent === true,
  };
  const limits = {
    name: 100,
    email: 254,
    phone: 40,
    company: 160,
    service: 120,
    budget: 120,
    message: 5000,
    timeline: 120,
    website: 200,
  } as const;

  for (const [key, limit] of Object.entries(limits) as [
    keyof typeof limits,
    number,
  ][]) {
    const value = raw[key];
    if (value !== undefined && typeof value !== "string") {
      errors[key] = "Please enter text in this field.";
      continue;
    }
    data[key] = typeof value === "string" ? value.trim() : "";
    if (data[key].length > limit)
      errors[key] = `Please use ${limit} characters or fewer.`;
    const invalidCharacters =
      key === "message"
        ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/
        : /[\u0000-\u001f\u007f]/;
    if (invalidCharacters.test(data[key]))
      errors[key] = "Please remove unsupported characters.";
  }

  if (!errors.name && data.name.length < 2)
    errors.name = "Please enter your name (at least 2 characters).";
  if (!errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Please enter a valid email address.";
  if (!errors.service) {
    const service = resolveService(data.service);
    if (!service) errors.service = "Please choose a service.";
    else data.service = service;
  }
  if (!errors.message && data.message.length < 20)
    errors.message =
      "Tell us a little more about your project (at least 20 characters).";
  if (!data.consent)
    errors.consent = "Please agree to the privacy policy so we can respond.";
  if (data.website)
    errors.website =
      "We could not accept this submission. Please contact us directly.";

  return Object.keys(errors).length
    ? { valid: false, errors }
    : { valid: true, data };
}

export function enquiryEmailText(data: EnquiryPayload): string {
  const label =
    ENQUIRY_SERVICES.find((service) => service.slug === data.service)?.label ??
    data.service;
  return [
    "New website project enquiry",
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone / WhatsApp: ${data.phone || "Not supplied"}`,
    `Business / brand: ${data.company || "Not supplied"}`,
    `Service: ${label}`,
    `Estimated budget: ${data.budget || "Not supplied"}`,
    `Preferred timeline: ${data.timeline || "Not supplied"}`,
    "",
    "Project description:",
    data.message,
    "",
    "The sender agreed to be contacted about this enquiry under the privacy policy.",
  ].join("\n");
}

export function web3FormsPayload(data: EnquiryPayload, accessKey: string) {
  return {
    access_key: accessKey,
    subject: WEB3FORMS_SUBJECT,
    from_name: "TheBenzzCreations",
    name: data.name,
    email: data.email,
    message: enquiryEmailText(data),
    botcheck: "",
  };
}

/** Best-effort process-local protection. Use a shared edge limiter across replicas in production. */
export function createEnquiryRateLimiter(limit = 5, windowMs = 15 * 60 * 1000) {
  const buckets = new Map<string, { count: number; expiresAt: number }>();
  return (
    key: string,
    now = Date.now(),
  ): { allowed: boolean; retryAfter: number } => {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.expiresAt <= now) buckets.delete(bucketKey);
    }
    const existing = buckets.get(key);
    if (existing) {
      if (existing.count >= limit)
        return {
          allowed: false,
          retryAfter: Math.max(1, Math.ceil((existing.expiresAt - now) / 1000)),
        };
      existing.count += 1;
      return { allowed: true, retryAfter: 0 };
    }
    // Bound memory even when addresses are varied. Unknown new clients back off at capacity.
    if (buckets.size >= 10_000) return { allowed: false, retryAfter: 60 };
    buckets.set(key, { count: 1, expiresAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  };
}

export function isAllowedEnquiryOrigin(
  origin: string | null,
  requestUrl: string,
  configuredUrl?: string,
  requestHost?: string | null,
): boolean {
  if (!origin) return false;
  try {
    const requestLocation = new URL(requestUrl);
    let effectiveOrigin = requestLocation.origin;
    if (requestHost !== undefined && requestHost !== null) {
      // Next.js can normalize its internal URL hostname to localhost. Use the
      // actual Host header without trusting arbitrary forwarded-host headers.
      if (!requestHost || /[\s/@?#\\]/.test(requestHost)) return false;
      effectiveOrigin = new URL(`${requestLocation.protocol}//${requestHost}`)
        .origin;
    }
    const allowed = new Set([effectiveOrigin]);
    if (configuredUrl) allowed.add(new URL(configuredUrl).origin);
    return allowed.has(new URL(origin).origin);
  } catch {
    return false;
  }
}
