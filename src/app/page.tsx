'use client';

import { Search, Home, Building2, MapPin } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[600px] bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10">
          <h1 className="text-5xl font-bold text-white mb-6">
            Find Your Dream Home
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Discover the perfect property that matches your lifestyle
          </p>
          
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-3xl">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by location..."
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Search size={20} />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Property Categories */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Property Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Home className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Houses</h3>
            <p className="text-gray-600">Find your perfect family home</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Building2 className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Apartments</h3>
            <p className="text-gray-600">Modern living spaces</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <MapPin className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Land</h3>
            <p className="text-gray-600">Build your dream from scratch</p>
          </div>
        </div>
      </div>

      {/* Featured Properties */}
      <div className="container mx-auto px-4 py-16 bg-gray-100">
        <h2 className="text-3xl font-bold mb-8">Featured Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Modern Apartment</h3>
                <p className="text-gray-600 mb-4">123 Main St, City</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-bold">$450,000</span>
                  <button className="text-blue-600 hover:text-blue-700">View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
