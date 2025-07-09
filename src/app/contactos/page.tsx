"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ContactCard } from "~/components/contactos/list/contact-card"
import { ContactCardSkeleton } from "~/components/contactos/list/contact-card-skeleton"
import { ContactFilter } from "~/components/contactos/list/contact-filter"
import { ContactTable } from "~/components/contactos/list/contact-table"
import { listContactsWithTypes } from "~/server/queries/contact"
import { contactUtils } from "~/lib/utils"
import type { Contact } from "~/lib/data"

// Extended Contact type to include contactType for the UI
interface ExtendedContact extends Omit<Contact, 'contactType'> {
  contactType: "demandante" | "propietario" | "banco" | "agencia" | "interesado"
  listingId?: bigint
  listingContactId?: bigint
  ownerCount?: number
  buyerCount?: number
  prospectTitle?: string | null
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
        // Fetch contacts from the database with their role counts
        const dbContacts = await listContactsWithTypes(1, 100) // Get first 100 contacts
        
        // Use the data directly from the query - contact type is already determined in the database query
        const extendedContacts: ExtendedContact[] = dbContacts.map((contact: any) => ({
          contactId: contact.contactId,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          additionalInfo: contact.additionalInfo,
          orgId: contact.orgId,
          isActive: contact.isActive,
          createdAt: contact.createdAt,
          updatedAt: contact.updatedAt,
          contactType: contact.contactType, // This is now determined in the query
          listingId: contact.firstListingId,
          street: contact.street,
          city: contact.city,
          propertyType: contact.propertyType,
          listingType: contact.listingType,
          ownerCount: contact.ownerCount,
          buyerCount: contact.buyerCount,
          prospectTitle: contact.prospectTitle, // Generated title for interesado contacts
        }))
        
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
    contactType: string[]
    sortOrder: string
  }) => {
    const filtered = contactsList.filter((contact) => {
      const matchesSearch = 
        contact.firstName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        contact.lastName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        (contact.email?.toLowerCase() ?? "").includes(filters.searchQuery.toLowerCase()) ||
        (contact.phone?.toLowerCase() ?? "").includes(filters.searchQuery.toLowerCase())

      const matchesContactType = filters.contactType.length === 0 || filters.contactType.includes(contact.contactType)

      return matchesSearch && matchesContactType
    })

    // Apply sorting
    const sorted = filtered.sort((a, b) => {
      if (filters.sortOrder === 'lastContact') {
        // Sort by last contact date (most recent first)
        // If lastContact is undefined, treat as very old date
        const aDate = a.updatedAt || new Date(0)
        const bDate = b.updatedAt || new Date(0)
        return bDate.getTime() - aDate.getTime()
      } else {
        // Default alphabetical sort by full name
        const aName = `${a.firstName} ${a.lastName}`.toLowerCase()
        const bName = `${b.firstName} ${b.lastName}`.toLowerCase()
        return aName.localeCompare(bName)
      }
    })

    setFilteredContacts(sorted)
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
              key={contact.contactId.toString()} 
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