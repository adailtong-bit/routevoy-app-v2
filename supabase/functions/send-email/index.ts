import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  let type = 'unknown'
  let email = ''
  let subject = 'Bem-vindo ao Routevoy!'
  let provider = 'mock'
  let emailSent = false
  let errorMessage: string | null = null

  try {
    const body = await req.json()
    type = body.type || 'unknown'
    email = body.email
    const name = body.name

    if (!email) {
      throw new Error('Email is required')
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    let html = `<h1>Olá ${name || ''},</h1><p>Bem-vindo ao Routevoy!</p>`

    if (type === 'welcome') {
      subject = 'Bem-vindo ao Routevoy! Confirme seu cadastro'
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #0f172a;">Olá ${name || ''},</h2>
          <p>Seja muito bem-vindo(a) ao <strong>Routevoy</strong>!</p>
          <p>O seu cadastro foi recebido com sucesso na nossa plataforma.</p>
          <p>Se você se cadastrou como <strong>Afiliado</strong> ou <strong>Franqueado</strong>, seu perfil passará por uma rápida análise pela nossa equipe de administração. Logo você receberá um e-mail de aprovação com a liberação dos seus acessos ao painel de geração de links e relatórios.</p>
          <p>Caso tenha se cadastrado como Usuário Comum, seu acesso para explorar as oportunidades já está liberado!</p>
          <br/>
          <p>Se tiver alguma dúvida, responda a este e-mail.</p>
          <p>Atenciosamente,<br/><strong>Equipe Routevoy</strong></p>
        </div>
      `
    } else if (type === 'affiliate_approved') {
      subject = 'Parabéns! Seu cadastro de Afiliado foi Aprovado no Routevoy 🎉'
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #16a34a;">Olá ${name || ''},</h2>
          <p>Temos uma ótima notícia para você!</p>
          <p>O seu cadastro como <strong>Afiliado Parceiro</strong> no Routevoy foi analisado e <strong>APROVADO</strong>.</p>
          <p>A partir de agora, você já pode acessar o seu Painel de Afiliado, gerar seus links exclusivos, acompanhar suas métricas e receber suas comissões.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://routevoy.com/login" style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
              Acessar Meu Painel Agora
            </a>
          </p>
          <br/>
          <p>Desejamos muito sucesso e ótimas vendas!</p>
          <p>Atenciosamente,<br/><strong>Equipe Routevoy</strong></p>
        </div>
      `
    }

    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Routevoy <contato@routevoy.com>',
          to: [email],
          subject: subject,
          html: html,
        }),
      })

      if (!res.ok) {
        const error = await res.text()
        console.error('Resend error:', error)
        throw new Error(`Failed to send email via Resend: ${error}`)
      }
      emailSent = true
      provider = 'resend'
    } else {
      console.log(`[Mock Email] To: ${email}, Subject: ${subject}`)
      emailSent = true
    }

    await supabaseClient.from('email_logs').insert({
      recipient: email,
      subject: subject,
      type: type,
      status: 'success',
      provider: provider,
      error_message: null,
    })

    return new Response(
      JSON.stringify({ success: true, emailSent, provider, email }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  } catch (error: any) {
    errorMessage = error.message

    if (email) {
      await supabaseClient.from('email_logs').insert({
        recipient: email,
        subject: subject,
        type: type,
        status: 'failed',
        provider: provider,
        error_message: errorMessage,
      })
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
