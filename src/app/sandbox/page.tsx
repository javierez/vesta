'use client'

import { Button } from "~/components/ui/button"
import { seedDatabase, testDatabaseConnection } from "./actions"
import { useTransition } from "react"
import { toast } from "sonner"
import OCRExample from "~/components/crear/ocr-example"

export default function SandboxPage() {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await seedDatabase()
        toast.success('Database seeded successfully')
      } catch (error) {
        console.error('Error seeding database:', error)
        toast.error('Failed to seed database')
      }
    })
  }

  const handleTestConnection = async () => {
    startTransition(async () => {
      try {
        const result = await testDatabaseConnection()
        if (result.success) {
          toast.success('Database connection successful')
        } else {
          toast.error(`Database connection failed: ${result.error}`)
        }
      } catch (error) {
        console.error('Error testing connection:', error)
        toast.error('Failed to test database connection')
      }
    })
  }

  const handleSeed = async () => {
    try {
      await seedDatabase()
      alert('Database seeded successfully!')
    } catch (error) {
      console.error('Error seeding database:', error)
      alert('Error seeding database. Check console for details.')
    }
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold">Sandbox</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Database Testing Section */}
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Database Connection Test</h2>
                <Button 
                  onClick={handleTestConnection} 
                  className="w-full" 
                  disabled={isPending}
                >
                  {isPending ? 'Testing...' : 'Test Database Connection'}
                </Button>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Seed Database</h2>
                <form
                  action={handleSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code>
                        {`// This will seed the database with properties`}
                      </code>
                    </pre>
                  </div>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? 'Seeding...' : 'Seed Database'}
                  </Button>
                </form>
              </div>
            </div>

            {/* OCR Testing Section */}
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">OCR Testing</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Test the OCR functionality with a sample document. 
                  Upload a property document first, then use the document key here.
                </p>
                
                {/* Example with a placeholder document key */}
                <OCRExample 
                  documentKey="temp_1234567890/documents/ficha_propiedad_sample.pdf"
                  onDataExtracted={(data) => {
                    console.log('Extracted property data:', data)
                    toast.success('Property data extracted successfully!')
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}