import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AdvertisersTab() {
  const [advertisers, setAdvertisers] = useState<any[]>([])

  useEffect(() => {
    const fetchAdv = async () => {
      const { data } = await supabase
        .from('ad_advertisers')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) setAdvertisers(data)
    }
    fetchAdv()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anunciantes Cadastrados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {advertisers.length === 0 ? (
            <p className="text-slate-500">
              Nenhum anunciante encontrado no sistema.
            </p>
          ) : (
            advertisers.map((adv) => (
              <div
                key={adv.id}
                className="p-4 border rounded-lg flex flex-col md:flex-row justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-lg text-slate-800">
                    {adv.company_name}
                  </h4>
                  <div className="text-sm text-slate-600 mt-1 space-y-0.5">
                    <p>
                      <strong>Contato:</strong> {adv.contact_name || 'N/A'}
                    </p>
                    <p>
                      <strong>Email:</strong> {adv.email}
                    </p>
                    <p>
                      <strong>CNPJ:</strong> {adv.tax_id}
                    </p>
                  </div>
                </div>
                <div>
                  <Badge variant="outline" className="capitalize">
                    {adv.status || 'Ativo'}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
