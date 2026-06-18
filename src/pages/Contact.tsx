import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export default function Contact() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    if (name === 'phone') {
      // Basic phone mask: (00) 00000-0000
      let v = value.replace(/\D/g, '')
      if (v.length > 11) v = v.slice(0, 11)
      if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`
      if (v.length > 10) v = `${v.slice(0, 10)}-${v.slice(10)}`
      setFormData((prev) => ({ ...prev, [name]: v }))
      return
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (val: string) => {
    setFormData((prev) => ({ ...prev, subject: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('contact_messages' as any).insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
        },
      ])

      if (error) throw error

      toast.success(t('contact_page.success', 'Message sent successfully!'))
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      })
    } catch (error) {
      console.error('Error submitting contact form:', error)
      toast.error(
        t('contact_page.error', 'Error sending message. Please try again.'),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center py-12 px-4 bg-slate-50/50 dark:bg-background">
      <div className="w-full max-w-3xl bg-white dark:bg-card p-8 rounded-2xl shadow-sm border">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {t('contact_page.title', 'Contact Us')}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t(
              'contact_page.desc',
              'Have a question or inquiry? Send us a message and our team will get back to you as soon as possible.',
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('contact_page.name', 'Full Name *')}
              </label>
              <Input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('contact_page.name_ph', 'Enter your full name')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('contact_page.email', 'Email *')}
              </label>
              <Input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t(
                  'contact_page.email_ph',
                  'Enter your email address',
                )}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('contact_page.phone', 'Phone *')}
              </label>
              <Input
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t(
                  'contact_page.phone_ph',
                  'Enter your phone number',
                )}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('contact_page.subject', 'Reason for contact *')}
              </label>
              <Select
                required
                value={formData.subject}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      'contact_page.subject_ph',
                      'Reason for contact',
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dúvida Geral">
                    {t('contact_page.subjects.general', 'General Inquiry')}
                  </SelectItem>
                  <SelectItem value="Suporte Técnico">
                    {t('contact_page.subjects.tech', 'Technical Support')}
                  </SelectItem>
                  <SelectItem value="Sugestão ou Reclamação">
                    {t(
                      'contact_page.subjects.suggestion',
                      'Suggestion or Complaint',
                    )}
                  </SelectItem>
                  <SelectItem value="Seja um Parceiro">
                    {t('contact_page.subjects.partner', 'Become a Partner')}
                  </SelectItem>
                  <SelectItem value="Outro">
                    {t('contact_page.subjects.other', 'Other')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('contact_page.message', 'Message *')}
            </label>
            <Textarea
              required
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={t(
                'contact_page.message_ph',
                'Type your message here',
              )}
              rows={5}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {t('contact_page.send', 'Send Message')}
          </Button>
        </form>
      </div>
    </div>
  )
}
