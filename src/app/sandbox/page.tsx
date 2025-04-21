import { Button } from "~/components/ui/button"
import { seedDatabase } from "./actions"

export default function SandboxPage() {
  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Seed Function</h1>
          <form
            action={seedDatabase}
            className="flex flex-col gap-4"
          >
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>
                  {`// This will seed the database with properties`}
                </code>
              </pre>
            </div>
            <Button type="submit" className="w-full">
              Seed Database
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}