"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ContactCard } from "~/components/contactos/contact-card"
import { ContactCardSkeleton } from "~/components/contactos/contact-card-skeleton"
import { ContactFilter } from "~/components/contactos/contact-filter"
import { ContactTable } from "~/components/contactos/contact-table"
import { listContactsWithTypes } from "~/server/queries/contact"
import { contactUtils } from "~/lib/utils"
import type { Contact } from "~/lib/data"

// Extended Contact type to include contactType for the UI
interface ExtendedContact extends Omit<Contact, 'contactType'> {
  contactType: "demandante" | "propietario" | "banco" | "agencia"
  listingId?: bigint
  listingContactId?: bigint
}

export default function ContactsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [contactsList, setContactsList] = useState<ExtendedContact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<ExtendedContact[]>([])
  const [view, setView] = useState<"grid" | "table">("grid")

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true)
      try {
        // Fetch contacts from the database with their contact types
        const dbContacts = await listContactsWithTypes(1, 100) // Get first 100 contacts
        
        // Transform database contacts to include contactType for UI compatibility
        const extendedContacts: ExtendedContact[] = dbContacts.map((contact: any) => {
          // Use centralized contact mapping function
          const mappedContact = contactUtils.createExtendedContact(contact);
          
          return {
            ...mappedContact,
            listingId: contact.listingId,
            listingContactId: contact.listingContactId,
          };
        })
        
        setContactsList(extendedContacts)
        setFilteredContacts(extendedContacts)
      } catch (error) {
        console.error("Error fetching contacts:", error)
        // Fallback to empty array if there's an error
        setContactsList([])
        setFilteredContacts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchContacts()
  }, [])

  const handleFilterChange = (filters: {
    searchQuery: string
    status: string[]
    type: string[]
  }) => {
    const filtered = contactsList.filter((contact) => {
      const matchesSearch = 
        contact.firstName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (contact.email?.toLowerCase() ?? "").includes(filters.searchQuery.toLowerCase()) ||
        (contact.phone?.toLowerCase() ?? "").includes(filters.searchQuery.toLowerCase())

      const matchesStatus = filters.status.length === 0 || filters.status.includes(contact.isActive ? "active" : "inactive")
      const matchesType = filters.type.length === 0 || filters.type.includes(contact.contactType)

      return matchesSearch && matchesStatus && matchesType
    })

    setFilteredContacts(filtered)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contactos</h1>
        <Button asChild>
          <Link href="/contactos/new">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Contacto
          </Link>
        </Button>
      </div>

      <ContactFilter 
        contacts={contactsList}
        onFilterChange={handleFilterChange}
        view={view}
        onViewChange={setView}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <ContactCardSkeleton key={index} />
          ))}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <ContactCard 
              key={`${contact.contactId.toString()}-${contact.listingContactId?.toString() || 'no-listing'}`} 
              contact={contact} 
            />
          ))}
        </div>
      ) : (
        <ContactTable contacts={filteredContacts} />
      )}
    </div>
  )
} 