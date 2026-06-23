import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Search,
  Mail,
  Reply,
  Phone,
  Clock,
  User,
  CheckCircle2,
  Inbox,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatDate } from '@/lib/utils'

export function AdminContactMessagesTab() {
  const { t } = useLanguage()
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedMsg, setSelectedMsg] = useState<any | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isReplying, setIsReplying] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error(t('admin.contact.fetch_error', 'Erro ao carregar mensagens.'))
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!replyText.trim() || !selectedMsg) return

    setIsReplying(true)
    try {
      const { error: fnError } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'contact_reply',
          email: selectedMsg.email,
          name: selectedMsg.name,
          subject: `Re: ${selectedMsg.subject || 'Contato'}`,
          message: replyText,
        },
      })

      if (fnError) {
        throw fnError
      }

      const { error: dbError } = await supabase
        .from('contact_messages')
        .update({
          status: 'replied',
          reply_text: replyText,
          replied_at: new Date().toISOString(),
        })
        .eq('id', selectedMsg.id)

      if (dbError) throw dbError

      toast.success(
        t('admin.contact.reply_success', 'Resposta enviada com sucesso!'),
      )
      setSelectedMsg(null)
      setReplyText('')
      fetchMessages()
    } catch (error: any) {
      console.error('Error sending reply:', error)
      toast.error(
        error.message ||
          t('admin.contact.reply_error', 'Erro ao enviar resposta.'),
      )
    } finally {
      setIsReplying(false)
    }
  }

  const filteredMessages = messages.filter(
    (m) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.subject?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-primary" />
              {t('admin.contact.title', 'Mensagens de Contato')}
            </CardTitle>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder={t('common.search', 'Buscar...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-4 font-medium">
                    {t('admin.contact.name', 'Nome')}
                  </th>
                  <th className="p-4 font-medium">
                    {t('admin.contact.subject', 'Assunto')}
                  </th>
                  <th className="p-4 font-medium">
                    {t('admin.contact.date', 'Data')}
                  </th>
                  <th className="p-4 font-medium">
                    {t('admin.contact.status', 'Status')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      {t('admin.contact.empty', 'Nenhuma mensagem encontrada.')}
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((msg) => (
                    <tr
                      key={msg.id}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedMsg(msg)}
                    >
                      <td className="p-4">
                        <div className="font-medium text-slate-900">
                          {msg.name}
                        </div>
                        <div className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" /> {msg.email}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-700">
                        {msg.subject ||
                          t('admin.contact.no_subject', 'Sem Assunto')}
                      </td>
                      <td className="p-4 text-slate-500">
                        {formatDate(msg.created_at)}
                      </td>
                      <td className="p-4">
                        {msg.status === 'replied' ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {t('admin.contact.status_replied', 'Respondido')}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-amber-600 bg-amber-50 border-amber-200"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {t('admin.contact.status_pending', 'Pendente')}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedMsg}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMsg(null)
            setReplyText('')
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              {t('admin.contact.details', 'Detalhes da Mensagem')}
            </DialogTitle>
          </DialogHeader>

          {selectedMsg && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                <div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                    {t('admin.contact.sender', 'Remetente')}
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <User className="w-4 h-4 text-slate-400" />
                    {selectedMsg.name}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <a
                      href={`mailto:${selectedMsg.email}`}
                      className="hover:text-primary hover:underline"
                    >
                      {selectedMsg.email}
                    </a>
                  </div>
                  {selectedMsg.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <a
                        href={`tel:${selectedMsg.phone}`}
                        className="hover:text-primary hover:underline"
                      >
                        {selectedMsg.phone}
                      </a>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                    {t('admin.contact.details', 'Detalhes')}
                  </div>
                  <div className="text-sm font-medium">
                    {selectedMsg.subject ||
                      t('admin.contact.no_subject', 'Sem Assunto')}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    {formatDate(selectedMsg.created_at)}
                  </div>
                  <div className="mt-2">
                    {selectedMsg.status === 'replied' ? (
                      <Badge className="bg-green-100 text-green-800 border-none">
                        {t('admin.contact.status_replied', 'Respondido')}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-amber-600 bg-amber-50 border-amber-200"
                      >
                        {t('admin.contact.status_pending', 'Pendente')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
                  {t('admin.contact.message', 'Mensagem')}
                </div>
                <div className="bg-white border p-4 rounded-lg text-sm whitespace-pre-wrap text-slate-700">
                  {selectedMsg.message}
                </div>
              </div>

              {selectedMsg.status === 'replied' ? (
                <div>
                  <div className="text-xs text-green-600 font-medium uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Reply className="w-4 h-4" />
                    {t('admin.contact.your_reply', 'Sua Resposta')} (
                    {formatDate(selectedMsg.replied_at)})
                  </div>
                  <div className="bg-green-50 border border-green-100 p-4 rounded-lg text-sm whitespace-pre-wrap text-slate-700">
                    {selectedMsg.reply_text}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500 font-medium uppercase tracking-wider flex items-center gap-1">
                    <Reply className="w-4 h-4" />
                    {t('admin.contact.write_reply', 'Escrever Resposta')}
                  </div>
                  <Textarea
                    placeholder={t(
                      'admin.contact.reply_placeholder',
                      'Escreva sua resposta aqui. Ela será enviada para o e-mail do remetente.',
                    )}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSelectedMsg(null)}>
              {t('common.close', 'Fechar')}
            </Button>
            {selectedMsg?.status !== 'replied' && (
              <Button
                onClick={handleReply}
                disabled={isReplying || !replyText.trim()}
              >
                {isReplying ? (
                  t('common.sending', 'Enviando...')
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    {t('admin.contact.send_reply', 'Enviar Resposta')}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
