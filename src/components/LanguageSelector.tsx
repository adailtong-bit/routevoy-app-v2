import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LanguageSelector() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-full shrink-0 hidden md:flex"
      aria-label="Language"
    >
      <Globe className="h-4 w-4 text-slate-600" />
    </Button>
  )
}
