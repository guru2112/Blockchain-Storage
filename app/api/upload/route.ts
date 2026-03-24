import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.PINATA_API_KEY;
    const apiSecret = process.env.PINATA_SECRET_API_KEY;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Missing Pinata API keys" },
        { status: 500 }
      );
    }

    const data = await req.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file → buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const formData = new FormData();
    formData.append("file", new Blob([buffer]), file.name);

    // Upload to Pinata
    const res = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          pinata_api_key: apiKey,
          pinata_secret_api_key: apiSecret,
        },
        body: formData,
      }
    );

    const result = await res.json();

    console.log("Pinata result:", result);

    // ❗ Prevent undefined CID
    if (!result.IpfsHash) {
      return NextResponse.json(
        { error: "Pinata upload failed", details: result },
        { status: 500 }
      );
    }

    return NextResponse.json({
      cid: result.IpfsHash,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
