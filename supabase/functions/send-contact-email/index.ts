import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const OWNER_EMAIL = Deno.env.get("RESEND_OWNER_EMAIL") || "kitaymw@gmail.com";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactEmailRequest = await req.json();

    console.log("Sending contact email from:", email, "name:", name);

    // Send email to Moja Serowarnia
    const { data: adminEmailData, error: adminEmailError } = await resend.emails.send({
      from: "Kontakt Moja Serowarnia <onboarding@resend.dev>",
      to: [OWNER_EMAIL],
      replyTo: email,
      subject: `Nowa wiadomość kontaktowa: ${subject}`,
      html: `
        <h2>Nowa wiadomość z formularza kontaktowego</h2>
        <p><strong>Od:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temat:</strong> ${subject}</p>
        <hr />
        <h3>Wiadomość:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (adminEmailError) {
      console.error("Error sending email to admin:", adminEmailError);
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: `Błąd wysyłania wiadomości: ${adminEmailError.message}` 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Email sent successfully to admin:", adminEmailData);

    // Send confirmation to sender
    const { data: confirmationData, error: confirmationError } = await resend.emails.send({
      from: "Moja Serowarnia <onboarding@resend.dev>",
      to: [email],
      subject: "Potwierdzenie otrzymania wiadomości - Moja Serowarnia",
      html: `
        <h2>Dziękujemy za kontakt, ${name}!</h2>
        <p>Otrzymaliśmy Twoją wiadomość i odpowiemy najszybciej jak to możliwe.</p>
        <hr />
        <h3>Twoja wiadomość:</h3>
        <p><strong>Temat:</strong> ${subject}</p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr />
        <p>Pozdrawiamy,<br>Zespół Moja Serowarnia</p>
      `,
    });

    if (confirmationError) {
      console.error("Error sending confirmation to sender:", confirmationError);
      // Don't fail the whole request if confirmation fails
      console.log("Main email delivered, but confirmation failed");
    } else {
      console.log("Confirmation email sent successfully:", confirmationData);
    }

    return new Response(JSON.stringify({ ok: true, data: adminEmailData }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
