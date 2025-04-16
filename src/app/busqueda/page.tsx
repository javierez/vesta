import { Suspense } from "react";
import Navbar from "~/components/navbar";
import Footer from "~/components/footer";
import { SearchBar } from "~/components/search-bar";
import { SearchPageClient } from "~/components/search-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Búsqueda de Propiedades",
  description: "Encuentra tu propiedad ideal",
};

type Props = {
  searchParams: Promise<{
    location?: string;
    tipo?: string;
    habitaciones?: string;
    banos?: string;
    precioMin?: string;
    precioMax?: string;
  }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  
  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <SearchPageClient 
            slug={[]} 
            searchParams={resolvedSearchParams} 
          />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
