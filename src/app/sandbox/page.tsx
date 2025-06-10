'use client'

import { Button } from "~/components/ui/button"
import { seedDatabase, testDatabaseConnection } from "./actions"
import { useTransition } from "react"
import { toast } from "sonner"

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

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Sandbox</h1>
          
          <div className="flex flex-col gap-4">
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
        </div>
      </div>
    </div>
  )
}