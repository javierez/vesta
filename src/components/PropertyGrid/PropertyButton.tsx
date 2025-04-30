"use client"

import { Button } from "~/components/ui/button"

interface PropertyButtonProps {
  text: string
  onClick?: () => void
}

export function PropertyButton({ text, onClick }: PropertyButtonProps) {
  return (
    <div className="mt-12 text-center">
      <Button size="lg" onClick={onClick}>{text}</Button>
    </div>
  )
} 