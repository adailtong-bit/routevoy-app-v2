import { useState } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Mail, Phone, MapPin, Send } from 'lucide-react'

export default function Contact() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    }

    try {
      const { error } = await supabase.from('contact_messages').insert([data])
      if (error) throw error

      toast.success(t('contact_page.success', 'Message sent successfully!'))
      ;(e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error(
        t('contact_page.error', 'Error sending message. Please try again.'),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t('contact_page.title', 'Contact Us')}
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            {t(
              'contact_page.desc',
              'Have a question or inquiry? Send us a message and our team will get back to you as soon as possible.',
            )}
          </p>
        </div>

        <div
          className="bg-white rounded-lg shadow-xl overflow-hidden md:flex animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          <div className="bg-blue-700 p-8 md:w-1/3 text-white">
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <Mail className="w-6 h-6 mr-4 mt-1 opacity-80" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-blue-100">contact@routevoy.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="w-6 h-6 mr-4 mt-1 opacity-80" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-blue-100">+1 234 567 8900</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-6 h-6 mr-4 mt-1 opacity-80" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-blue-100">
                    123 Tech Street, Suite 456
                    <br />
                    City, Country
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:w-2/3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {t('contact_page.name', 'Full Name *')}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder={t(
                      'contact_page.name_ph',
                      'Enter your full name',
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t('contact_page.email', 'Email *')}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder={t(
                      'contact_page.email_ph',
                      'Enter your email address',
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {t('contact_page.phone', 'Phone *')}
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    required
                    placeholder={t(
                      'contact_page.phone_ph',
                      'Enter your phone number',
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">
                    {t('contact_page.subject', 'Reason for contact *')}
                  </Label>
                  <Select name="subject" required defaultValue="general">
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          'contact_page.subject_ph',
                          'Reason for contact',
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">
                        {t('contact_page.subjects.general', 'General Inquiry')}
                      </SelectItem>
                      <SelectItem value="tech">
                        {t('contact_page.subjects.tech', 'Technical Support')}
                      </SelectItem>
                      <SelectItem value="suggestion">
                        {t(
                          'contact_page.subjects.suggestion',
                          'Suggestion or Complaint',
                        )}
                      </SelectItem>
                      <SelectItem value="partner">
                        {t('contact_page.subjects.partner', 'Become a Partner')}
                      </SelectItem>
                      <SelectItem value="other">
                        {t('contact_page.subjects.other', 'Other')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">
                  {t('contact_page.message', 'Message *')}
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder={t(
                    'contact_page.message_ph',
                    'Type your message here',
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={loading}
              >
                {loading ? (
                  <span className="animate-spin mr-2">⏳</span>
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {t('contact_page.send', 'Send Message')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
