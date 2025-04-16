import { Suspense } from "react"
import Navbar from "~/components/navbar"
import Footer from "~/components/footer"
import { SearchBar } from "~/components/search-bar"
import { SearchPageClient } from "~/components/search-page-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Resultados de Búsqueda",
  description: "Encuentra tu propiedad ideal",
}

type Props = {
  params: Promise<{ slug: string[] }>
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function SearchPage({ params, searchParams }: Props) {
  const resolvedParams = await params
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <SearchPageClient slug={resolvedParams.slug} searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
