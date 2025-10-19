import { Suspense } from "react";
import ContactForm from "~/components/contactos/crear/contact-form";

export default function CreateContactPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
      <ContactForm />
    </Suspense>
  );
}
