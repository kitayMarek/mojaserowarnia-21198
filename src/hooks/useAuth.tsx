import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, profileData?: ProfileData) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

interface ProfileData {
  firma_nazwa?: string;
  nip?: string;
  adres?: string;
  telefon?: string;
  marketing_consent?: boolean;
  /** Brzmienie zgody, ktore czlowiek widzial przy kwadraciku — zapisujemy je
   *  razem z samym "tak", bo gdy tekst kiedys sie zmieni, samo "tak" niczego
   *  nie dowodzi. Zrodlo: TRESC_ZGODY w src/pages/Auth.tsx. */
  marketing_consent_tresc?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, profileData?: ProfileData) => {
    const redirectUrl = `${window.location.origin}/`;
    
    // Dane profilu ida w options.data, czyli do raw_user_meta_data na serwerze.
    // Stamtad odbiera je wyzwalacz handle_new_user_profile i tworzy profil.
    //
    // ⚠ WCZESNIEJ BYLO INACZEJ I NIE DZIALALO. Profil zakladala przegladarka,
    // osobnym insertem zaraz po rejestracji. Przy wlaczonym potwierdzaniu adresu
    // signUp NIE ZWRACA SESJI — czlowiek ma konto, ale nie jest zalogowany —
    // wiec zapis szedl jako anon i regula "TO authenticated" go odrzucala.
    // Blad ladowal w console.error w cudzej przegladarce, a uzytkownik widzial
    // "rejestracja udana". Trzy pierwsze rejestracje po przenosinach skonczyly
    // sie kontem bez profilu i bez zapisanej zgody.
    //
    // Wyzwalacz nadajacy range uzytkownika dzialal przez caly ten czas, bo od
    // poczatku byl po stronie serwera. Roznica jest tylko w tym.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          firma_nazwa: profileData?.firma_nazwa ?? null,
          nip: profileData?.nip ?? null,
          adres: profileData?.adres ?? null,
          telefon: profileData?.telefon ?? null,
          marketing_consent: profileData?.marketing_consent ?? false,
          marketing_consent_tresc: profileData?.marketing_consent_tresc ?? null,
        },
      },
    });

    if (error) return { error };
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    navigate("/");
    toast({
      title: "Wylogowano",
      description: "Zostałeś pomyślnie wylogowany",
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
