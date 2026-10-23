import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export const SEROWARNIA = "https://mojaserowarnia.pl";

/**
 * Adresy, których mojapasza nie ma (serwatka, prawo RHD, poradniki serowarskie),
 * to linki w treści stron pasz prowadzące do Serowarni. Przenosimy tam od razu,
 * z tą samą ścieżką, zamiast pokazywać pustą stronę.
 */
const DoSerowarni = () => {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    window.location.replace(`${SEROWARNIA}${pathname}${search}${hash}`);
  }, [pathname, search, hash]);
  return <LoadingSpinner />;
};

export default DoSerowarni;
