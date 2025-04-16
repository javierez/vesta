import { Suspense } from "react"
import Navbar from "~/components/navbar"
import Footer from "~/components/footer"
import { SearchBar } from "~/components/search-bar"
import { SearchPageClient } from "~/components/search-page-client"

interface PageProps {
  params: { slug: string[] }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function SearchPage({ params, searchParams }: PageProps) {
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <SearchPageClient slug={params.slug} searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
