import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/stores/LanguageContext'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

export default function Contact() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'general',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      })

      if (error) throw error

      toast.success(t('contact_page.success', 'Message sent successfully!'))
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'general',
        message: '',
      })
    } catch (err) {
      console.error(err)
      toast.error(
        t('contact_page.error', 'Error sending message. Please try again.'),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">
            {t('contact_page.title', 'Contact Us')}
          </CardTitle>
          <CardDescription>
            {t(
              'contact_page.desc',
              'Have a question or inquiry? Send us a message and our team will get back to you as soon as possible.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('contact_page.name', 'Full Name *')}
                </label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder={t(
                    'contact_page.name_ph',
                    'Enter your full name',
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('contact_page.email', 'Email *')}
                </label>
                <Input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder={t(
                    'contact_page.email_ph',
                    'Enter your email address',
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t('contact_page.phone', 'Phone *')}
                </label>
                <Input
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, phone: e.target.value }))
                  }
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
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, subject: e.target.value }))
                  }
                >
                  <option value="general">
                    {t('contact_page.subjects.general', 'General Inquiry')}
                  </option>
                  <option value="tech">
                    {t('contact_page.subjects.tech', 'Technical Support')}
                  </option>
                  <option value="suggestion">
                    {t(
                      'contact_page.subjects.suggestion',
                      'Suggestion or Complaint',
                    )}
                  </option>
                  <option value="partner">
                    {t('contact_page.subjects.partner', 'Become a Partner')}
                  </option>
                  <option value="other">
                    {t('contact_page.subjects.other', 'Other')}
                  </option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('contact_page.message', 'Message *')}
              </label>
              <Textarea
                required
                rows={6}
                value={formData.message}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, message: e.target.value }))
                }
                placeholder={t(
                  'contact_page.message_ph',
                  'Type your message here',
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading
                ? t('common.loading', 'Loading...')
                : t('contact_page.send', 'Send Message')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
