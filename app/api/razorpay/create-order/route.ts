import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawAmount = Number(body.amount);
    if (!rawAmount || isNaN(rawAmount) || rawAmount <= 0) {
      return NextResponse.json(
        { status: false, message: "Valid amount in paisa is required" },
        { status: 400 }
      );
    }

    const keyId =
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_KEY_ID ||
      "rzp_test_TvL5gF2aAKznOU";

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET ||
      "0M6Jtfd5rdMYANYXnNfItrpY";

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { status: false, message: "Razorpay credentials not configured" },
        { status: 500 }
      );
    }

    const receipt = body.receipt || `order_rcpt_${Date.now()}`;
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: Math.round(rawAmount),
        currency: body.currency || "INR",
        receipt: receipt.slice(0, 40),
        notes: body.notes || { platform: "web_booking" },
      }),
    });

    const data = await rzpResponse.json();

    if (!rzpResponse.ok || !data.id) {
      console.error("Razorpay order creation failed from API:", data);
      return NextResponse.json(
        {
          status: false,
          message: data?.error?.description || "Failed to create Razorpay order",
          error: data,
        },
        { status: rzpResponse.status || 500 }
      );
    }

    return NextResponse.json({
      status: true,
      message: "Razorpay order created successfully",
      order_id: data.id,
      key: keyId,
      amount: data.amount,
      currency: data.currency,
    });
  } catch (error: any) {
    console.error("Error in /api/razorpay/create-order route:", error);
    return NextResponse.json(
      { status: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

