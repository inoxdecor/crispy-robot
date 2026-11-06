import assert from "node:assert/strict";
import test, { mock } from "node:test";
import { NextRequest } from "next/server";
import { POST } from "../app/api/enquiry/route";
import {
  WEB3FORMS_PUBLIC_ACCESS_KEY,
  createEnquiryRateLimiter,
  enquiryEmailText,
  isAllowedEnquiryOrigin,
  resolveService,
  validateEnquiry,
  web3FormsPayload,
} from "../lib/enquiry";

const validInput = {
  name: "Asha Kumar",
  email: "asha@example.com",
  phone: "",
  company: "Example Studio",
  service: "websites",
  budget: "",
  message: "We need a clear, accessible website for our new business.",
  timeline: "",
  website: "",
  consent: true,
};

test("accepts and normalizes a valid enquiry with optional fields omitted", () => {
  const result = validateEnquiry({
    name: " Asha Kumar ",
    email: "asha@example.com",
    service: "Custom Website Development",
    message: validInput.message,
    consent: true,
  });
  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.name, "Asha Kumar");
    assert.equal(result.data.service, "websites");
    assert.equal(result.data.phone, "");
  }
});

test("rejects missing fields and unexpected data types", () => {
  const result = validateEnquiry({
    ...validInput,
    name: 42,
    email: "invalid",
    service: "made-up-service",
    message: "short",
    consent: "true",
  });
  assert.equal(result.valid, false);
  if (!result.valid)
    for (const field of [
      "name",
      "email",
      "service",
      "message",
      "consent",
    ] as const)
      assert.ok(result.errors[field]);
  assert.equal(validateEnquiry(null).valid, false);
  assert.equal(validateEnquiry([]).valid, false);
});

test("rejects honeypot spam, oversized descriptions and single-line header injection", () => {
  for (const input of [
    { ...validInput, website: "spam.invalid" },
    { ...validInput, message: "x".repeat(5001) },
    { ...validInput, name: "Asha\r\nBcc: attacker@example.com" },
    { ...validInput, email: "asha@example.com\nBcc: other@example.com" },
  ])
    assert.equal(validateEnquiry(input).valid, false);
});

test("allows multiline project details and generates a plain-text email", () => {
  const result = validateEnquiry({
    ...validInput,
    message:
      "First project goal.\nSecond project goal.\n<script>text only</script>",
  });
  assert.equal(result.valid, true);
  if (result.valid) {
    const email = enquiryEmailText(result.data);
    assert.match(email, /Custom Website Development/);
    assert.match(email, /First project goal\.\nSecond project goal\./);
    assert.match(email, /Phone \/ WhatsApp: Not supplied/);
  }
});

test("resolves engagement links to real displayed services", () => {
  assert.equal(resolveService("essential-presence"), "websites");
  assert.equal(resolveService("custom-product-engineering"), "custom-software");
  assert.equal(resolveService("ongoing-partnership"), "seo-support");
  assert.equal(resolveService("invalid"), "");
});

test("rate limiter isolates clients, blocks the threshold, and expires buckets", () => {
  const limiter = createEnquiryRateLimiter(2, 10_000);
  assert.equal(limiter("a", 1000).allowed, true);
  assert.equal(limiter("a", 1001).allowed, true);
  assert.deepEqual(limiter("a", 1002), { allowed: false, retryAfter: 10 });
  assert.equal(limiter("b", 1002).allowed, true);
  assert.equal(limiter("a", 11_000).allowed, true);
});

test("origin guard permits same-origin and configured canonical requests only", () => {
  assert.equal(
    isAllowedEnquiryOrigin(
      "http://localhost:3000",
      "http://localhost:3000/api/enquiry",
    ),
    true,
  );
  assert.equal(
    isAllowedEnquiryOrigin(
      "https://www.thebenzzcreations.com",
      "http://internal:3000/api/enquiry",
      "https://www.thebenzzcreations.com",
    ),
    true,
  );
  assert.equal(
    isAllowedEnquiryOrigin(
      "https://attacker.invalid",
      "https://www.thebenzzcreations.com/api/enquiry",
    ),
    false,
  );
  assert.equal(
    isAllowedEnquiryOrigin(
      null,
      "https://www.thebenzzcreations.com/api/enquiry",
    ),
    false,
  );
  assert.equal(
    isAllowedEnquiryOrigin(
      "not a URL",
      "https://www.thebenzzcreations.com/api/enquiry",
    ),
    false,
  );
});

let requestId = 0;
function apiRequest(body: unknown, extraHeaders: Record<string, string> = {}) {
  return new NextRequest("http://localhost:3000/api/enquiry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "http://localhost:3000",
      "x-real-ip": `test-${requestId++}`,
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
}

test("API uses the actual Host when Next.js normalizes its internal hostname", async () => {
  const previousProvider = process.env.ENQUIRY_PROVIDER;
  process.env.ENQUIRY_PROVIDER = "web3forms";
  const outbound = mock.method(globalThis, "fetch", async () => {
    throw new Error("Origin validation must not send enquiries");
  });
  const request = (body: unknown, origin = "http://127.0.0.1:3011") =>
    new NextRequest("http://localhost:3011/api/enquiry", {
      method: "POST",
      headers: {
        host: "127.0.0.1:3011",
        origin,
        "Content-Type": "application/json",
        "x-real-ip": `host-regression-${requestId++}`,
      },
      body: JSON.stringify(body),
    });
  try {
    assert.equal((await POST(request({}))).status, 400);
    const valid = await POST(request(validInput));
    assert.equal(valid.status, 200);
    assert.equal((await valid.json()).validated, true);
    assert.equal((await POST(request(validInput, "https://attacker.invalid"))).status, 403);
    assert.equal(outbound.mock.callCount(), 0);
    assert.equal(isAllowedEnquiryOrigin("http://localhost:3011", "http://localhost:3011/api/enquiry", undefined, "127.0.0.1:3011"), false);
    assert.equal(isAllowedEnquiryOrigin("http://127.0.0.1", "http://localhost:3011/api/enquiry", undefined, "127.0.0.1"), true);
    assert.equal(isAllowedEnquiryOrigin("http://127.0.0.1:3011", "http://localhost:3011/api/enquiry", undefined, "attacker.invalid@127.0.0.1:3011"), false);
  } finally {
    outbound.mock.restore();
    if (previousProvider === undefined) delete process.env.ENQUIRY_PROVIDER;
    else process.env.ENQUIRY_PROVIDER = previousProvider;
  }
});

test("API rejects cross-origin requests and invalid payloads without contacting delivery", async () => {
  const outbound = mock.method(globalThis, "fetch", async () => {
    throw new Error("Outbound delivery must not run");
  });
  try {
    assert.equal(
      (
        await POST(
          apiRequest(validInput, { origin: "https://attacker.invalid" }),
        )
      ).status,
      403,
    );
    assert.equal(
      (await POST(apiRequest({ ...validInput, email: "invalid" }))).status,
      400,
    );
    assert.equal(
      (await POST(apiRequest(validInput, { "content-length": "20000" })))
        .status,
      413,
    );
    assert.equal(outbound.mock.callCount(), 0);
  } finally {
    outbound.mock.restore();
  }
});

test("Web3Forms validation returns a browser delivery handshake, never a delivery success claim", async () => {
  const previousProvider = process.env.ENQUIRY_PROVIDER;
  process.env.ENQUIRY_PROVIDER = "web3forms";
  const outbound = mock.method(globalThis, "fetch", async () => {
    throw new Error("Web3Forms must not be proxied server-side");
  });
  try {
    const result = await POST(apiRequest(validInput));
    assert.equal(result.status, 200);
    const body = await result.json();
    assert.equal(body.validated, true);
    assert.equal(body.delivery.provider, "web3forms");
    assert.equal(
      body.delivery.accessKey,
      process.env.WEB3FORMS_ACCESS_KEY || WEB3FORMS_PUBLIC_ACCESS_KEY,
    );
    assert.notEqual(body.success, true);
    assert.equal(outbound.mock.callCount(), 0);
  } finally {
    outbound.mock.restore();
    if (previousProvider === undefined) delete process.env.ENQUIRY_PROVIDER;
    else process.env.ENQUIRY_PROVIDER = previousProvider;
  }
});

test("browser delivery payload preserves contact and project details for provider validation", () => {
  const payload = web3FormsPayload(validInput, WEB3FORMS_PUBLIC_ACCESS_KEY);
  assert.equal(payload.access_key, WEB3FORMS_PUBLIC_ACCESS_KEY);
  assert.equal(payload.email, validInput.email);
  assert.equal(payload.name, validInput.name);
  assert.match(payload.message, /Custom Website Development/);
  assert.match(payload.message, /Example Studio/);
  assert.equal(payload.botcheck, "");
});

test("API returns an honest unavailable response for unconfigured SMTP", async () => {
  const previousProvider = process.env.ENQUIRY_PROVIDER;
  const previousHost = process.env.SMTP_HOST;
  process.env.ENQUIRY_PROVIDER = "smtp";
  process.env.SMTP_HOST = "";
  try {
    const result = await POST(apiRequest(validInput));
    assert.equal(result.status, 503);
    const body = await result.json();
    assert.notEqual(body.success, true);
    assert.match(body.error, /has not been sent/);
  } finally {
    if (previousProvider === undefined) delete process.env.ENQUIRY_PROVIDER;
    else process.env.ENQUIRY_PROVIDER = previousProvider;
    if (previousHost === undefined) delete process.env.SMTP_HOST;
    else process.env.SMTP_HOST = previousHost;
  }
});
