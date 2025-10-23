import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ListingNotificationRequest {
  tokenName: string;
  tokenSymbol: string;
  tokenAddress: string;
  transactionHash: string;
  submitterAddress: string;
  websiteUrl?: string;
  telegramUrl?: string;
  twitterUrl?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      tokenName,
      tokenSymbol,
      tokenAddress,
      transactionHash,
      submitterAddress,
      websiteUrl,
      telegramUrl,
      twitterUrl,
    }: ListingNotificationRequest = await req.json();

    console.log("Sending listing notification for:", tokenName);

    const emailResponse = await resend.emails.send({
      from: "GIGACOCK Platform <onboarding@resend.dev>",
      to: ["protolgantol@gmail.com"],
      subject: `New Token Listing: ${tokenName} (${tokenSymbol})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #8b5cf6; border-bottom: 2px solid #8b5cf6; padding-bottom: 10px;">
            🚀 New Token Listing Submission
          </h1>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Token Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Token Name:</td>
                <td style="padding: 8px 0;">${tokenName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Token Symbol:</td>
                <td style="padding: 8px 0;">${tokenSymbol}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Token Address:</td>
                <td style="padding: 8px 0; word-break: break-all; font-family: monospace; font-size: 12px;">${tokenAddress}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
            <h2 style="color: #333; margin-top: 0;">💰 Payment Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Transaction Hash:</td>
                <td style="padding: 8px 0; word-break: break-all; font-family: monospace; font-size: 12px;">${transactionHash}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Submitter Address:</td>
                <td style="padding: 8px 0; word-break: break-all; font-family: monospace; font-size: 12px;">${submitterAddress}</td>
              </tr>
            </table>
            <p style="margin-top: 10px; font-size: 12px; color: #666;">
              ⚠️ Please verify the transaction on blockchain explorer
            </p>
          </div>

          ${websiteUrl || telegramUrl || twitterUrl ? `
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">🔗 Social Links</h2>
            <ul style="list-style: none; padding: 0;">
              ${websiteUrl ? `<li style="padding: 5px 0;">🌐 Website: <a href="${websiteUrl}" target="_blank">${websiteUrl}</a></li>` : ''}
              ${telegramUrl ? `<li style="padding: 5px 0;">📱 Telegram: <a href="${telegramUrl}" target="_blank">${telegramUrl}</a></li>` : ''}
              ${twitterUrl ? `<li style="padding: 5px 0;">🐦 Twitter/X: <a href="${twitterUrl}" target="_blank">${twitterUrl}</a></li>` : ''}
            </ul>
          </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; text-align: center;">
            <p>This is an automated notification from GIGACOCK Platform</p>
            <p>Timestamp: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-listing-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
