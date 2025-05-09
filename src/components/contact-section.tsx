import { getContactProps } from "~/server/queries/contact"
import { ContactContent } from "~/components/contact/ContactContent"

export async function ContactSection() {
  const contactProps = await getContactProps()

  // Fallbacks in case data is missing
  const title = contactProps?.title || "Contáctanos"
  const subtitle = contactProps?.subtitle || "¿Tienes preguntas o estás listo para dar el siguiente paso? Nuestro equipo está aquí para ayudarte con todas tus necesidades inmobiliarias."
  const messageForm = contactProps?.messageForm ?? true
  const address = contactProps?.address ?? true
  const phone = contactProps?.phone ?? true
  const mail = contactProps?.mail ?? true
  const schedule = contactProps?.schedule ?? true
  const map = contactProps?.map ?? true

  return (
    <ContactContent
      title={title}
      subtitle={subtitle}
      messageForm={messageForm}
      address={address}
      phone={phone}
      mail={mail}
      schedule={schedule}
      map={map}
      contactProps={contactProps}
    />
  )
}
