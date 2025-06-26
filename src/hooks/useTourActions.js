import React from 'react';
import { toast } from '@/components/ui/use-toast';

export default function useTourActions() {
  const scrollTo = (selector) => {
    const el = document.querySelector(selector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const loadModule = (name) => {
    return React.lazy(() => import(`@/pages/${name}.jsx`));
  };

  const showCertificate = () => {
    toast({
      title: 'Certificado',
      description: 'TODO: Implementar CertificateCanvas',
    });
  };

  return { scrollTo, loadModule, showCertificate };
}
