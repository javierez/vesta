"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Plus, Search, Filter, X, Check, ChevronDown } from "lucide-react"
import Link from "next/link"
import { ContactCard } from "~/components/contactos/contact-card"
import { ContactCardSkeleton } from "~/components/contactos/contact-card-skeleton"
import { contacts } from "~/lib/data"
import type { Contact } from "~/lib/data"
import { Badge } from "~/components/ui/badge"
import { ScrollArea } from "~/components/ui/scroll-area"
import { ContactFilter } from "~/components/contactos/contact-filter"
import { ContactTable } from "~/components/contactos/contact-table"

export default function ContactsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [contactsList, setContactsList] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [view, setView] = useState<"grid" | "table">("grid")

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setContactsList(contacts)
      setFilteredContacts(contacts)
      setIsLoading(false)
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
      const matchesType = filters.type.length === 0 // TODO: Add contact type field

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
            <ContactCard key={contact.contactId.toString()} contact={contact} />
          ))}
        </div>
      ) : (
        <ContactTable contacts={filteredContacts} />
      )}
    </div>
  )
} 