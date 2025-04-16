import { Suspense } from "react"
import Navbar from "~/components/navbar"
import Footer from "~/components/footer"
import { SearchBar } from "~/components/search-bar"
import { SearchPageClient } from "~/components/search-page-client"

// This is the correct type for Next.js 14 page props
type Props = {
  params: { slug: string[] }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function SearchPage({ params, searchParams }: Props) {
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
