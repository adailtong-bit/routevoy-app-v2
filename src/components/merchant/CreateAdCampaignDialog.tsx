import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { supabase } from '@/lib/supabase/client'
import {
  Plus,
  Image as ImageIcon,
  Check,
  ChevronsUpDown,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function CreateAdCampaignDialog({
  companyId,
  environment,
  onCreated,
}: any) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [openCombo, setOpenCombo] = useState(false)

  const [form, setForm] = useState({
    title: '',
    category: '',
    image: '',
    promotionModel: 'standard',
    description: '',
    isSeasonal: false,
  })

  useEffect(() => {
    if (open) {
      supabase
        .from('categories')
        .select('id, name, label')
        .eq('status', 'active')
        .order('label')
        .then(({ data }) => data && setCategories(data))
    }
  }, [open])

  const handleSave = async () => {
    if (!form.title || !form.category) {
      return toast.error('Title and Category are required')
    }

    setIsLoading(true)

    const { error } = await supabase.from('ad_campaigns').insert({
      company_id: companyId,
      title: form.title,
      category: form.category,
      image: form.image || null,
      promotion_model: form.promotionModel,
      description: form.description || null,
      is_seasonal: form.isSeasonal,
      environment: environment || 'production',
      status: 'active',
    })

    setIsLoading(false)

    if (error) {
      console.error(error)
      return toast.error('Failed to create campaign')
    }

    toast.success('Campaign created successfully')
    setOpen(false)
    setForm({
      title: '',
      category: '',
      image: '',
      promotionModel: 'standard',
      description: '',
      isSeasonal: false,
    })

    onCreated?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-bold shadow-md hover:-translate-y-0.5 transition-transform">
          <Plus className="w-4 h-4 mr-2" /> Create Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="space-y-5 mt-2">
            {/* 1. Campaign Title */}
            <div>
              <Label className="mb-2 block">Campaign Title</Label>
              <Input
                placeholder="Enter campaign title..."
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* 2. Category Selection (Combobox) */}
            <div className="flex flex-col">
              <Label className="mb-2">Category</Label>
              <Popover open={openCombo} onOpenChange={setOpenCombo}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombo}
                    className="justify-between w-full font-normal"
                  >
                    {form.category
                      ? categories.find((c) => c.name === form.category)?.label
                      : 'Select a category...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[450px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search category..." />
                    <CommandList>
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((c) => (
                          <CommandItem
                            key={c.id}
                            value={c.label}
                            onSelect={() => {
                              setForm({ ...form, category: c.name })
                              setOpenCombo(false)
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                form.category === c.name
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                            {c.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* 3. Image Upload/Preview Area */}
            <div>
              <Label className="mb-2 block">Campaign Image (URL)</Label>
              <Input
                placeholder="https://..."
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />
              {form.image ? (
                <img
                  src={form.image}
                  alt="Preview"
                  className="mt-2 h-32 w-full object-cover rounded-md border"
                />
              ) : (
                <div className="mt-2 h-32 w-full rounded-md border border-dashed flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                  <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                  <span className="text-sm">Image Preview</span>
                </div>
              )}
            </div>

            {/* 4. Promotion Model */}
            <div>
              <Label className="mb-2 block">Promotion Model</Label>
              <Select
                value={form.promotionModel}
                onValueChange={(v) => setForm({ ...form, promotionModel: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                  <SelectItem value="voucher">Voucher</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 5. Campaign Description */}
            <div>
              <Label className="mb-2 block">Campaign Description</Label>
              <Textarea
                placeholder="Provide detailed information about the promotion..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="min-h-[100px]"
              />
            </div>

            {/* 6. Is Seasonal Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label className="text-base">Seasonal Offer</Label>
                <p className="text-sm text-slate-500">
                  Mark this campaign as a seasonal or holiday special.
                </p>
              </div>
              <Switch
                checked={form.isSeasonal}
                onCheckedChange={(v) => setForm({ ...form, isSeasonal: v })}
              />
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 pt-4 border-t flex justify-end gap-3 bg-slate-50/50 rounded-b-lg">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{' '}
            Save Campaign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
