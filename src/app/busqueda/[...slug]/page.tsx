import { Suspense } from "react"
import Navbar from "~/components/navbar"
import Footer from "~/components/footer"
import { SearchBar } from "~/components/search-bar"
import { SearchPageClient } from "~/components/search-page-client"

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: { slug: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
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
