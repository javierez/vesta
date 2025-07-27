"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";

interface AboutButtonProps {
  text: string;
  href: string;
}

export function AboutButton({ text, href }: AboutButtonProps) {
  return (
    <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
      <Button size="lg" asChild>
        <Link href={href}>{text}</Link>
      </Button>
    </div>
  );
}
