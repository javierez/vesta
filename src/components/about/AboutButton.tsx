"use client"

import Link from "next/link"
import { Button } from "~/components/ui/button"

interface AboutButtonProps {
  text: string
  href: string
}

export function AboutButton({ text, href }: AboutButtonProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
      <Button size="lg" asChild>
        <Link href={href}>{text}</Link>
      </Button>
    </div>
  )
} 