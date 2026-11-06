import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  BUSINESS_EMAIL,
  WEB3FORMS_PUBLIC_ACCESS_KEY,
  WEB3FORMS_SUBJECT,
  MAX_ENQUIRY_BYTES,
  createEnquiryRateLimiter,
  enquiryEmailText,
  isAllowedEnquiryOrigin,
  validateEnquiry,
} from "@/lib/enquiry";

export const runtime = "nodejs";
const rateLimit = createEnquiryRateLimiter();
const headers = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest) {
  if (
    !isAllowedEnquiryOrigin(
      request.headers.get("origin"),
      request.url,
      process.env.NEXT_PUBLIC_SITE_URL,
      request.headers.get("host"),
    )
  ) {
    return NextResponse.json(
      { error: "Please send your enquiry from this website." },
      { status: 403, headers },
    );
  }
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  ) {
    return NextResponse.json(
      { error: "Please use the project enquiry form." },
      { status: 415, headers },
    );
  }

  // Trust forwarded IP headers only behind a platform that replaces incoming client values.
  const clientKey = (
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    "unidentified"
  )
    .trim()
    .slice(0, 128);
  const limit = rateLimit(clientKey);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error:
          "Too many attempts. Please try again in a few minutes, or email us directly.",
      },
      {
        status: 429,
        headers: { ...headers, "Retry-After": String(limit.retryAfter) },
      },
    );
  }

  let input: unknown;
  try {
    const announcedLength = Number(request.headers.get("content-length") || 0);
    if (announcedLength > MAX_ENQUIRY_BYTES)
      return NextResponse.json(
        { error: "Your enquiry is too long. Please shorten it and try again." },
        { status: 413, headers },
      );
    const reader = request.body?.getReader();
    if (!reader)
      return NextResponse.json(
        { error: "Please complete the enquiry form." },
        { status: 400, headers },
      );
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_ENQUIRY_BYTES) {
        await reader.cancel();
        return NextResponse.json(
          {
            error: "Your enquiry is too long. Please shorten it and try again.",
          },
          { status: 413, headers },
        );
      }
      chunks.push(value);
    }
    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return NextResponse.json(
      { error: "We could not read your enquiry. Please try again." },
      { status: 400, headers },
    );
  }

  const result = validateEnquiry(input);
  if (!result.valid)
    return NextResponse.json(
      { error: "Please check the highlighted fields.", errors: result.errors },
      { status: 400, headers },
    );

  const provider = process.env.ENQUIRY_PROVIDER || "web3forms";
  if (provider === "web3forms") {
    // Web3Forms requires direct browser submission on its standard plan.
    // Validation authorizes that next step; it does not mean delivery succeeded.
    const accessKey =
      process.env.WEB3FORMS_ACCESS_KEY || WEB3FORMS_PUBLIC_ACCESS_KEY;
    return NextResponse.json(
      { validated: true, delivery: { provider: "web3forms", accessKey } },
      { headers },
    );
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } =
    process.env;
  const port = Number(SMTP_PORT || 587);
  if (
    provider !== "smtp" ||
    !SMTP_HOST ||
    !SMTP_USER ||
    !SMTP_PASSWORD ||
    !SMTP_FROM ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    return NextResponse.json(
      {
        error:
          "The enquiry form is temporarily unavailable. Your message has not been sent. Please email or WhatsApp us using the links below.",
      },
      { status: 503, headers },
    );
  }

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
  try {
    const delivery = await transport.sendMail({
      from: SMTP_FROM,
      to: BUSINESS_EMAIL,
      replyTo: { name: result.data.name, address: result.data.email },
      subject: WEB3FORMS_SUBJECT,
      text: enquiryEmailText(result.data),
    });
    if (!delivery.accepted?.length) throw new Error("Recipient not accepted");
    return NextResponse.json(
      {
        success: true,
        message:
          "Your enquiry has been sent. We’ll reply to the email address you provided.",
      },
      { headers },
    );
  } catch {
    // Never log contact details, message contents, credentials or provider responses.
    return NextResponse.json(
      {
        error:
          "We could not confirm delivery. Please email or WhatsApp us directly so your enquiry reaches us.",
      },
      { status: 502, headers },
    );
  } finally {
    transport.close();
  }
}
