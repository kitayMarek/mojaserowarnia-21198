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

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Escape HTML special characters to prevent XSS
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Sanitize string input - remove potentially dangerous characters
function sanitizeInput(input: string, maxLength: number): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[\r\n]{3,}/g, '\n\n'); // Limit consecutive newlines
}

// Validate email format
function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length <= 255;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactEmailRequest = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Wszystkie pola są wymagane' 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Nieprawidłowy format adresu email' 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name, 100);
    const sanitizedEmail = email.trim().toLowerCase().slice(0, 255);
    const sanitizedSubject = sanitizeInput(subject, 200);
    const sanitizedMessage = sanitizeInput(message, 2000);

    // Validate sanitized input lengths
    if (sanitizedName.length < 2) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Imię musi mieć co najmniej 2 znaki' 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (sanitizedMessage.length < 10) {
      return new Response(
        JSON.stringify({ 
          ok: false, 
          error: 'Wiadomość musi mieć co najmniej 10 znaków' 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Sending contact email from:", sanitizedEmail, "name:", sanitizedName);

    // Send email to Moja Serowarnia (using sanitized and escaped inputs)
    const { data: adminEmailData, error: adminEmailError } = await resend.emails.send({
      from: "Kontakt Moja Serowarnia <onboarding@resend.dev>",
      to: [OWNER_EMAIL],
      replyTo: sanitizedEmail,
      subject: `Nowa wiadomość kontaktowa: ${escapeHtml(sanitizedSubject)}`,
      html: `
        <h2>Nowa wiadomość z formularza kontaktowego</h2>
        <p><strong>Od:</strong> ${escapeHtml(sanitizedName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(sanitizedEmail)}</p>
        <p><strong>Temat:</strong> ${escapeHtml(sanitizedSubject)}</p>
        <hr />
        <h3>Wiadomość:</h3>
        <p>${escapeHtml(sanitizedMessage).replace(/\n/g, '<br>')}</p>
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

    // Send confirmation to sender (using sanitized and escaped inputs)
    const { data: confirmationData, error: confirmationError } = await resend.emails.send({
      from: "Moja Serowarnia <onboarding@resend.dev>",
      to: [sanitizedEmail],
      subject: "Potwierdzenie otrzymania wiadomości - Moja Serowarnia",
      html: `
        <h2>Dziękujemy za kontakt, ${escapeHtml(sanitizedName)}!</h2>
        <p>Otrzymaliśmy Twoją wiadomość i odpowiemy najszybciej jak to możliwe.</p>
        <hr />
        <h3>Twoja wiadomość:</h3>
        <p><strong>Temat:</strong> ${escapeHtml(sanitizedSubject)}</p>
        <p>${escapeHtml(sanitizedMessage).replace(/\n/g, '<br>')}</p>
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
