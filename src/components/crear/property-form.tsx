"use client"

import { Card } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"

interface PropertyFormProps {
  listingId: string
}

export default function PropertyForm({ listingId }: PropertyFormProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              🏠 Hello World! 🏠
            </h1>
            <p className="text-center text-gray-600 mb-6">
              Welcome to the Property Creation Form
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Listing ID:</strong> {listingId}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Property Title</Label>
              <Input
                id="title"
                placeholder="Enter property title..."
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                placeholder="Enter price..."
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Enter property description..."
                className="w-full h-24 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-center pt-4">
              <Button className="px-8 py-3">
                Save Property
              </Button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 text-center">
              ✅ This is a working Hello World component! The params Promise is properly unwrapped.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
