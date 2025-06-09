'use client'

import { Button } from "~/components/ui/button"
import { seedDatabase } from "./actions"
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

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Seed Function</h1>
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
  )
}