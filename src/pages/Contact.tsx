import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().trim().min(2, { message: "Imię musi mieć co najmniej 2 znaki" }).max(100),
  email: z.string().trim().email({ message: "Nieprawidłowy adres email" }).max(255),
  messageType: z.string().min(1, { message: "Wybierz typ wiadomości" }),
  subject: z.string().trim().min(3, { message: "Temat musi mieć co najmniej 3 znaki" }).max(200),
  message: z.string().trim().min(10, { message: "Wiadomość musi mieć co najmniej 10 znaków" }).max(2000),
});

const Contact = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Kontakt - Moja Serowarnia";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Skontaktuj się z nami. Moja Serowarnia - centrum wiedzy o serowarstwie. Odpowiadamy na pytania i pomagamy w nauce produkcji sera.");
    }
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      messageType: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: values,
      });

      if (error) {
        console.error("Function invocation error:", error);
        
        // Track error event
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'contact_form_submit', {
            status: 'error',
            error_name: error.message || 'unknown_error'
          });
        }
        
        throw new Error(error.message || "Błąd wywołania funkcji");
      }

    // Check if the function returned an error in its response
    if (data && !data.ok) {
      console.error("Function returned error:", data.error);
      
      // Convert error to string if it's an object
      const errorMessage = typeof data.error === 'object' 
        ? (data.error?.message || JSON.stringify(data.error))
        : (data.error || "Nie udało się wysłać wiadomości. Spróbuj ponownie.");
      
      // Track error event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'contact_form_submit', {
          status: 'error',
          error_name: typeof data.error === 'string' ? data.error : 'function_error'
        });
      }
      
      toast.error("Błąd wysyłania", {
        description: errorMessage,
      });
      return;
    }

      // Track success event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'contact_form_submit', {
          status: 'success'
        });
      }

      toast.success("Wiadomość wysłana!", {
        description: "Odpowiemy najszybciej jak to możliwe.",
      });

      form.reset();
    } catch (error) {
      console.error("Error sending email:", error);
      
      // Track error event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'contact_form_submit', {
          status: 'error',
          error_name: error instanceof Error ? error.message : 'unknown_error'
        });
      }
      
      toast.error("Błąd wysyłania", {
        description: error instanceof Error ? error.message : "Nie udało się wysłać wiadomości. Spróbuj ponownie.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "admin@mojaserowarnia.pl",
      href: "mailto:admin@mojaserowarnia.pl",
    },
    {
      icon: MapPin,
      title: "Lokalizacja",
      content: "Polska",
      href: null,
    },
    {
      icon: Phone,
      title: "Godziny odpowiedzi",
      content: "Pon-Pt: 9:00 - 17:00",
      href: null,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Skontaktuj się z nami
            </h1>
            <p className="text-lg text-muted-foreground">
              Masz pytanie? Chcesz współpracować? Napisz do nas!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              {contactInfo.map((info) => {
                const Icon = info.icon;
                return (
                  <Card key={info.title} className="bg-card hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                          {info.href ? (
                            <a 
                              href={info.href}
                              className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                              {info.content}
                            </a>
                          ) : (
                            <p className="text-sm text-muted-foreground">{info.content}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Contact Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Wyślij wiadomość</CardTitle>
                <CardDescription>
                  Wypełnij formularz poniżej, a odpowiemy na Twoją wiadomość najszybciej jak to możliwe.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Imię i nazwisko</FormLabel>
                            <FormControl>
                              <Input placeholder="Jan Kowalski" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="jan@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="messageType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Typ wiadomości</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Wybierz typ zapytania" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="question">Pytanie ogólne</SelectItem>
                              <SelectItem value="error">🚨 Zauważyłeś błąd?</SelectItem>
                              <SelectItem value="cooperation">Propozycja współpracy</SelectItem>
                              <SelectItem value="suggestion">Sugestia/pomysł</SelectItem>
                              <SelectItem value="other">Inne</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temat</FormLabel>
                          <FormControl>
                            <Input placeholder="Pytanie o kultury bakteryjne" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wiadomość</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Napisz swoją wiadomość..." 
                              className="min-h-[150px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full md:w-auto"
                      disabled={isSubmitting}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Wysyłanie..." : "Wyślij wiadomość"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
