import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { saveDiscoveredPromotion } from '@/lib/api'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  discount: z.string().optional(),
  price: z.coerce.number().optional(),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required'),
  limitType: z.string().optional(),
  totalLimit: z.coerce.number().optional(),
  engagementThreshold: z.coerce.number().min(0).optional(),
  rewardType: z.string().optional(),
  rewardValue: z.coerce.number().min(0).optional(),
  rewardDescription: z.string().optional(),
  rewardScope: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
}

export function CampaignFormDialog({ open, onOpenChange, companyId }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      discount: '',
      price: 0,
      imageUrl: '',
      category: 'Geral',
      limitType: 'unlimited',
      totalLimit: 0,
      engagementThreshold: 0,
      rewardType: '',
      rewardValue: 0,
      rewardDescription: '',
      rewardScope: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await saveDiscoveredPromotion({
        ...data,
        companyId,
        status: 'active',
        isSeasonal: true,
        sourceId: 'merchant-panel',
        storeName: 'My Store',
        region: 'Global',
      })
      toast.success('Campaign created successfully!')
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create campaign')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Seasonal Campaign</DialogTitle>
          <DialogDescription>
            Configure your promotion and set up engagement rewards.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Summer Sale 50% OFF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Fashion, Electronics..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Campaign details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Label</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 20% OFF" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-800">
                Engagement Rewards
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="engagementThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Engagement Goal (Shares)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormDescription>
                        Number of shares required to unlock the reward.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rewardType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefit Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a benefit type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Compound Discount">
                            Compound Discount
                          </SelectItem>
                          <SelectItem value="Free Item">Free Item</SelectItem>
                          <SelectItem value="Store Credit (Fixed Value)">
                            Store Credit (Fixed Value)
                          </SelectItem>
                          <SelectItem value="Standard Discount">
                            Standard Discount
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="rewardScope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefit Scope</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select scope" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Physical Store">
                            Physical Store
                          </SelectItem>
                          <SelectItem value="Online Store">
                            Online Store
                          </SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rewardValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefit Value</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="rewardDescription"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Benefit Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Free Coffee or Extra 10% Off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Save Campaign
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
