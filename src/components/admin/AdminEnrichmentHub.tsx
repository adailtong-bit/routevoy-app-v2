import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Layers,
  Plus,
  Search,
  Trash2,
  Loader2,
  CalendarIcon,
  Edit,
  CheckCircle,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { HierarchicalLocationSelector } from '@/components/HierarchicalLocationSelector'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export function AdminEnrichmentHub() {
  const { t } = useLanguage()
  const [dbCategories, setDbCategories] = useState<any[]>([])
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Filters
  const [searchTitle, setSearchTitle] = useState('')
  const [searchCategory, setSearchCategory] = useState('all')
  const [demoOnly, setDemoOnly] = useState(true)
  const [searchDate, setSearchDate] = useState<Date | undefined>()

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [editStatus, setEditStatus] = useState<string>('')
  const [editCategory, setEditCategory] = useState<string>('')

  // Generator Modal
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [genStore, setGenStore] = useState('')
  const [genCategory, setGenCategory] = useState('')
  const [genQty, setGenQty] = useState('5')
  const [genCountry, setGenCountry] = useState('')
  const [genState, setGenState] = useState('')
  const [genCity, setGenCity] = useState('')
  const [genDate, setGenDate] = useState<Date>(new Date())

  useEffect(() => {
    const loadCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('status', 'active')
      if (data) setDbCategories(data)
    }
    loadCategories()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    let query = supabase
      .from('discovered_promotions')
      .select(
        'id, title, store_name, status, is_demo, created_at, city, state, country, category',
      )

    if (demoOnly) {
      query = query.eq('is_demo', true)
    }

    if (searchTitle) {
      query = query.ilike('title', `%${searchTitle}%`)
    }

    if (searchCategory && searchCategory !== 'all') {
      query = query.eq('category', searchCategory)
    }

    if (searchDate) {
      const start = new Date(searchDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(searchDate)
      end.setHours(23, 59, 59, 999)
      query = query
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
    }

    query = query.order('created_at', { ascending: false }).limit(100)

    const res = await query
    if (res.data) setData(res.data)
    setSelectedIds(new Set())
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [demoOnly, searchCategory, searchDate])

  const handleGenerate = async () => {
    if (!genCategory || !genQty) {
      toast.error(t('common.error', 'Preencha os campos obrigatórios'))
      return
    }

    setIsGenerating(true)

    const qty = parseInt(genQty)
    const newCoupons = []

    const categoryData: Record<
      string,
      {
        stores: string[]
        titles: string[]
        descriptions: string[]
        queries: string[]
        priceRange: [number, number]
      }
    > = {
      food: {
        stores: [
          'Lumina Gastronomia',
          'Sabor & Brasa',
          'Bistrô Étoile',
          'Cantina da Nonna',
          'Osteria Del Mare',
          "Tasca d'Oro",
          'Maison du Goût',
        ],
        titles: [
          'Experiência Gastronômica: Menu Degustação em 5 Tempos',
          'Rodízio Premium: Cortes Nobres Selecionados',
          'Jantar Romântico com Harmonização de Vinhos',
          'Festival de Frutos do Mar Frescos',
          'Brunch Executivo de Alto Padrão',
        ],
        descriptions: [
          'Descubra um universo de sabores em nossa nova experiência gastronômica. Cuidadosamente preparado pelo nosso chef executivo, este menu degustação leva você a uma jornada inesquecível pelos melhores ingredientes sazonais. Reserve sua mesa e deixe-se surpreender pela excelência de cada prato.',
          'Sinta a verdadeira essência da alta gastronomia com nosso exclusivo rodízio premium. Trabalhamos apenas com cortes nobres e selecionados, garantindo maciez e sabor inigualáveis. Acompanha guarnições artesanais feitas para complementar cada mordida.',
          'Transforme sua noite em um momento memorável com nosso jantar harmonizado. Um ambiente intimista e sofisticado, onde cada prato foi perfeitamente desenhado para combinar com nossa seleção internacional de vinhos. Celebre o amor e o bom gosto.',
          'Explore o frescor e a leveza do nosso festival de frutos do mar. Trazemos o melhor do oceano diretamente para a sua mesa, com receitas exclusivas que destacam a qualidade e o sabor original dos ingredientes.',
          'A combinação perfeita entre negócios e prazer. Nosso brunch executivo oferece uma variedade incrível de pães artesanais, frios selecionados, pratos quentes sofisticados e sobremesas irresistíveis, em um ambiente elegante e acolhedor.',
        ],
        queries: ['fine dining', 'steak', 'gourmet food', 'seafood', 'brunch'],
        priceRange: [150, 450],
      },
      fashion: {
        stores: [
          'Urban Chic Boutique',
          'Aura Store',
          'Elegance Paris',
          'Hype Streetwear',
          'Moda Milano',
          'Nova Vanguarda',
          'Atelier Blanc',
        ],
        titles: [
          'Coleção Outono-Inverno: Elegância e Conforto',
          'Peças Exclusivas: A Nova Tendência Urbana',
          'Vestuário Premium: Sofisticação para o Dia a Dia',
          'Acessórios de Grife: Detalhes que Transformam',
          'Moda Sustentável: Estilo com Propósito',
        ],
        descriptions: [
          'Renove seu guarda-roupa com nossa recém-lançada coleção. Desenvolvida por designers renomados, cada peça combina tecidos de altíssima qualidade com cortes que valorizam a silhueta, oferecendo conforto absoluto sem abrir mão da elegância.',
          'Destaque-se na multidão com a nossa linha de peças exclusivas. Inspirada nas maiores capitais da moda, esta coleção traz as tendências mais quentes da cena urbana diretamente para o seu closet. Expresse sua identidade com ousadia e atitude.',
          'A verdadeira sofisticação reside na simplicidade e na qualidade. Nossa linha de vestuário premium foi criada para quem não tem tempo a perder, mas exige estar impecável em todas as ocasiões. Peças versáteis, duráveis e incrivelmente estilosas.',
          'Um look não está completo sem os detalhes certos. Descubra nossa seleção rigorosa de acessórios de grife, desde bolsas em couro legítimo até joias minimalistas, desenhados para elevar qualquer composição a um nível de excelência.',
          'Sinta-se bem consigo mesmo e com o planeta. Apresentamos uma coleção inteiramente baseada em práticas sustentáveis, utilizando materiais ecológicos e processos éticos. Moda que faz a diferença, estilo que permanece.',
        ],
        queries: [
          'fashion model',
          'boutique',
          'trendy clothing',
          'accessories',
          'sustainable fashion',
        ],
        priceRange: [200, 800],
      },
      electronics: {
        stores: [
          'Lumina Tech',
          'NextGen Store',
          'Gadget Hub',
          'SmartTech Solutions',
          'Future Vision',
        ],
        titles: [
          'Smartphone Ultra Vision: O Futuro em Suas Mãos',
          'Notebook Pro Max: Produtividade Sem Limites',
          'Fone com Cancelamento de Ruído: Imersão Total',
          'Smart TV 4K OLED: Cinema na Sua Sala',
          'Smartwatch Elite: Saúde e Conectividade',
        ],
        descriptions: [
          'Experimente a tecnologia de amanhã, hoje. O novo Smartphone Ultra Vision vem equipado com um processador de última geração, câmera profissional com IA e uma bateria que acompanha seu ritmo. A evolução do design e da performance em um único aparelho.',
          'Eleve sua produtividade a patamares nunca vistos. O Notebook Pro Max foi projetado para criadores, desenvolvedores e profissionais que exigem velocidade extrema, gráficos impecáveis e um design ultrafino. Liberdade para trabalhar onde e como quiser.',
          'Desligue-se do mundo lá fora e mergulhe em um universo sonoro de pura fidelidade. Com nossa tecnologia avançada de cancelamento ativo de ruído, você experimentará graves profundos e agudos cristalinos, garantindo o foco absoluto no que realmente importa.',
          'Transforme sua casa em uma verdadeira sala de cinema. A Smart TV 4K OLED entrega cores vibrantes, pretos puros e um contraste infinito. Com inteligência artificial integrada, ela otimiza imagem e som em tempo real para uma experiência inigualável.',
          'Mantenha-se conectado e cuide da sua saúde com estilo. O Smartwatch Elite oferece monitoramento contínuo de sinais vitais, acompanhamento de atividades físicas e sincronização perfeita com seu smartphone. Seu assistente pessoal no pulso.',
        ],
        queries: [
          'smartphone',
          'laptop',
          'headphones',
          'smart tv',
          'smartwatch',
        ],
        priceRange: [500, 5000],
      },
      beauty: {
        stores: [
          'Glow Spa',
          'Essência & Beleza',
          'Atelier de Beaute',
          'Harmony Clinic',
          'Belleza Pura',
        ],
        titles: [
          'Dia de Spa Completo: Relaxamento Profundo',
          'Tratamento Facial Rejuvenescedor Avançado',
          'Design de Sobrancelhas e Alongamento de Cílios',
          'Massagem Terapêutica com Pedras Quentes',
          'Pacote Transformation: Cabelo, Pele e Unhas',
        ],
        descriptions: [
          'Fuja do estresse diário com o nosso pacote de Dia de Spa Completo. Deixe nossos especialistas cuidarem de você com um circuito que inclui massagens revigorantes, banhos aromáticos e terapias de bem-estar. O momento de autocuidado que você merece.',
          'Devolva a luminosidade e a firmeza da sua pele. Nosso tratamento facial utiliza tecnologia de ponta e princípios ativos poderosos para suavizar linhas de expressão, limpar profundamente e hidratar, revelando uma aparência mais jovem e radiante.',
          'Valorize seu olhar e transforme a expressão do seu rosto. Nossas técnicas avançadas de design de sobrancelhas e alongamento de cílios são personalizadas para harmonizar perfeitamente com os seus traços, garantindo um resultado natural e deslumbrante.',
          'Liberte-se das tensões acumuladas com uma massagem terapêutica que combina movimentos relaxantes com a energia térmica das pedras quentes. Uma terapia milenar que reequilibra corpo e mente, promovendo uma sensação duradoura de paz interior.',
          'Prepare-se para brilhar em qualquer ocasião. Nosso pacote Transformation oferece uma consultoria de imagem completa, incluindo corte moderno, coloração, tratamentos faciais revitalizantes e cuidados de manicure. Uma verdadeira renovação visual.',
        ],
        queries: [
          'spa',
          'facial treatment',
          'eyelashes',
          'hot stone massage',
          'beauty salon',
        ],
        priceRange: [100, 400],
      },
      services: {
        stores: [
          'Prime Auto Service',
          'CleanHouse Pro',
          'Expert Fix Solutions',
          'Assistência VIP',
          'Serviços Expressos Master',
        ],
        titles: [
          'Revisão Automotiva Completa de 40 Itens',
          'Limpeza Profunda de Estofados e Tapetes',
          'Manutenção Premium de Eletrodomésticos',
          'Serviço de Dedetização Ecológica',
          'Pacote Residencial: Reparos Rápidos e Seguros',
        ],
        descriptions: [
          'Garante a sua segurança e a da sua família na estrada. Nossa revisão automotiva analisa criteriosamente 40 itens fundamentais do seu veículo, utilizando equipamentos de diagnóstico de alta precisão. Qualidade, transparência e confiança em cada serviço.',
          'Restaure a beleza e o frescor da sua casa. Nossa equipe especializada utiliza produtos de ponta e técnicas avançadas para a limpeza e higienização profunda de sofás, tapetes e colchões. Elimina ácaros, bactérias e manchas difíceis sem danificar os tecidos.',
          'Não deixe que um imprevisto atrapalhe a sua rotina. Oferecemos assistência técnica rápida e eficiente para os seus eletrodomésticos, contando com profissionais altamente capacitados e peças originais. Garantimos o bom funcionamento dos seus equipamentos.',
          'Proteja seu ambiente sem comprometer a saúde e a natureza. Nosso serviço de dedetização utiliza métodos seguros e produtos ecológicos e inodoros, garantindo a erradicação de pragas de forma eficiente. Um lar livre de insetos e cheio de tranquilidade.',
          'A solução definitiva para os pequenos problemas do dia a dia. Nosso pacote de reparos residenciais inclui desde ajustes elétricos e hidráulicos até instalações diversas, tudo executado por técnicos certificados e com garantia de qualidade. Praticidade na porta de casa.',
        ],
        queries: [
          'auto repair',
          'cleaning service',
          'appliance repair',
          'pest control',
          'handyman',
        ],
        priceRange: [80, 500],
      },
      market: {
        stores: [
          'Empório Gourmet',
          'Mercado Orgânico',
          'Wine & Cheese Club',
          'Frescor Hortifruti',
          'Casa das Especiarias',
        ],
        titles: [
          'Cesta de Produtos Orgânicos Premium',
          'Seleção de Queijos Artesanais e Vinhos',
          'Kit Degustação de Cafés Especiais',
          'Carnes Nobres para o Churrasco Perfeito',
          'Especiarias e Condimentos Exóticos',
        ],
        descriptions: [
          'Leve a saúde para a sua mesa. Nossa cesta premium é montada semanalmente com os melhores produtos orgânicos da estação, selecionados diretamente de pequenos produtores rurais. Ingredientes frescos, sem agrotóxicos e repletos de sabor.',
          'Transforme qualquer noite em uma celebração. Nossa curadoria especial traz os mais finos queijos artesanais, cuidadosamente harmonizados com vinhos de safras exclusivas. Uma viagem pelos sabores e texturas da alta gastronomia no conforto da sua casa.',
          'Desperte os seus sentidos com nossa linha de cafés especiais. Produzidos em fazendas premiadas, nossos grãos passam por um rigoroso processo de torra que exalta suas notas aromáticas, acidez equilibrada e sabor marcante. Um verdadeiro ritual para os amantes de café.',
          'Prepare-se para receber os amigos com a melhor qualidade. Nossa seleção de carnes nobres inclui cortes com marmoreio perfeito, garantindo maciez e suculência incomparáveis. Tudo o que você precisa para o churrasco inesquecível de fim de semana.',
          'Dê um toque de mestre às suas receitas. Descubra uma variedade incrível de especiarias e condimentos raros importados das mais diversas regiões do mundo. Eleve o padrão das suas criações culinárias com aromas intensos e sabores genuínos.',
        ],
        queries: [
          'organic food',
          'wine and cheese',
          'specialty coffee',
          'bbq meat',
          'spices',
        ],
        priceRange: [50, 250],
      },
      leisure: {
        stores: [
          'Adventure Park Hub',
          'Cine Max Premium',
          'Clube de Lazer Paradise',
          'Escape Room Mysteries',
          'Boliche & Lounge Bar',
        ],
        titles: [
          'Passaporte Aventura: Tirolesa e Arvorismo',
          'Noite de Cinema VIP com Pipoca Gourmet',
          'Day Use Exclusivo: Piscinas e Trilhas',
          'Desafio Escape Room para Grupos',
          'Pistas de Boliche e Cocktails Exclusivos',
        ],
        descriptions: [
          'Acelere o seu coração e desafie os seus limites! Nosso Passaporte Aventura dá acesso a circuitos desafiadores de arvorismo e tirolesas emocionantes, tudo sob a supervisão de instrutores experientes e em total harmonia com a natureza exuberante.',
          'Mergulhe na magia do cinema com o máximo de conforto. Nossas salas VIP contam com poltronas reclináveis de couro, serviço de atendimento na cadeira e uma pipoca gourmet irresistível. Assista às maiores estreias em som e imagem de última geração.',
          'Relaxe e reconecte-se. Aproveite o nosso Day Use e tenha acesso a um complexo completo de lazer, com piscinas climatizadas, trilhas ecológicas, áreas de descanso e opções de gastronomia requintada. O refúgio perfeito para o seu final de semana.',
          'Teste sua criatividade e trabalho em equipe em nosso Escape Room imersivo. Encontre as pistas escondidas, desvende enigmas complexos e escape a tempo. Uma experiência interativa e eletrizante, ideal para celebrar com amigos ou família.',
          'Diversão garantida para a sua noite. Reúna os amigos para disputadas partidas nas nossas modernas pistas de boliche, enquanto desfrutam de um cardápio exclusivo de drinks autorais e petiscos deliciosos em nosso confortável lounge bar.',
        ],
        queries: [
          'zipline adventure',
          'vip cinema',
          'resort pool',
          'escape room',
          'bowling alley',
        ],
        priceRange: [60, 300],
      },
      General: {
        stores: [
          'Oásis Center',
          'Vitrine Exclusiva',
          'Galeria Concept',
          'Universo Prime',
          'Mundo Ofertas',
        ],
        titles: [
          'Oferta Especial de Lançamento',
          'Mega Desconto de Fim de Semana',
          'Produto Premium com Condições Únicas',
          'Kits Promocionais Imperdíveis',
          'Acesso Antecipado: Novidades da Semana',
        ],
        descriptions: [
          'Não perca esta oportunidade incrível! Preparamos uma oferta de lançamento desenhada especialmente para você, com benefícios que vão muito além da economia. Garanta acesso a produtos de altíssima qualidade com condições que você não verá tão cedo.',
          'O fim de semana chegou e, com ele, a sua chance de adquirir aquele item tão desejado. Aproveite nossos descontos agressivos por tempo limitado. Uma curadoria rigorosa de produtos com preços que desafiam o mercado.',
          'A definição de exclusividade. Descubra um nível superior de sofisticação e funcionalidade com as nossas mais recentes novidades. Este produto não apenas atende às suas expectativas, como também eleva o seu padrão de vida diário.',
          'Pensando em facilitar a sua rotina, preparamos kits promocionais repletos de valor agregado. A combinação perfeita dos nossos itens mais vendidos, agora disponíveis em pacotes pensados estrategicamente para oferecer praticidade e uma excelente relação custo-benefício.',
          'Esteja sempre um passo à frente. Nossos clientes fiéis merecem privilégios reais, e é por isso que oferecemos acesso antecipado às maiores inovações da semana. Descubra, antes de todos, as tendências que vão dominar o mercado.',
        ],
        queries: [
          'shopping mall',
          'exclusive deal',
          'premium product',
          'discount sign',
          'retail store',
        ],
        priceRange: [40, 600],
      },
    }

    for (let i = 0; i < qty; i++) {
      const dataRef = categoryData[genCategory] || categoryData.General

      let finalStore = genStore
      if (!finalStore) {
        finalStore =
          dataRef.stores[Math.floor(Math.random() * dataRef.stores.length)]
      }

      const originalPrice =
        dataRef.priceRange[0] +
        Math.random() * (dataRef.priceRange[1] - dataRef.priceRange[0])
      const discountPercent = 15 + Math.floor(Math.random() * 40)
      const price = originalPrice * (1 - discountPercent / 100)

      const title =
        dataRef.titles[Math.floor(Math.random() * dataRef.titles.length)]
      const description =
        dataRef.descriptions[
          Math.floor(Math.random() * dataRef.descriptions.length)
        ]
      const query =
        dataRef.queries[Math.floor(Math.random() * dataRef.queries.length)]

      newCoupons.push({
        title,
        store_name: finalStore,
        category: genCategory,
        description,
        discount: `${discountPercent}% OFF`,
        discount_percentage: discountPercent,
        price: parseFloat(price.toFixed(2)),
        original_price: parseFloat(originalPrice.toFixed(2)),
        image_url: `https://img.usecurling.com/p/600/400?q=${encodeURIComponent(query)}&dpr=2`,
        status: 'Encerrada',
        is_demo: true,
        environment: 'production',
        country: genCountry,
        state: genState,
        city: genCity,
        created_at: genDate.toISOString(),
        start_date: new Date(genDate.getTime() - 86400000 * 5).toISOString(),
        end_date: new Date(genDate.getTime() - 86400000).toISOString(),
        code: `PROMO${Math.floor(Math.random() * 10000)}`,
        unique_hash: `demo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${i}`,
      })
    }

    const { error } = await supabase
      .from('discovered_promotions')
      .insert(newCoupons)

    setIsGenerating(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success(
        t('admin.generator.success', 'Anúncios gerados com sucesso!'),
      )
      setIsGeneratorOpen(false)
      fetchData()
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length && data.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.map((d) => d.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const handleBulkDelete = async () => {
    if (!confirm(t('common.confirm_delete', 'Tem certeza?'))) return
    const { error } = await supabase
      .from('discovered_promotions')
      .delete()
      .in('id', Array.from(selectedIds))
    if (error) toast.error(error.message)
    else {
      toast.success(t('common.success', 'Excluído com sucesso'))
      fetchData()
    }
  }

  const handleBulkPublish = async () => {
    if (
      !confirm(
        t(
          'common.confirm_publish_bulk',
          'Tem certeza que deseja publicar os itens selecionados?',
        ),
      )
    )
      return
    const { error } = await supabase
      .from('discovered_promotions')
      .update({ status: 'Ativa' })
      .in('id', Array.from(selectedIds))
    if (error) toast.error(error.message)
    else {
      toast.success('Publicado com sucesso')
      fetchData()
    }
  }

  const handleSingleAction = async (
    id: string,
    action: 'publish' | 'delete' | 'edit',
  ) => {
    if (action === 'delete') {
      if (!confirm(t('common.confirm_delete', 'Tem certeza?'))) return
      const { error } = await supabase
        .from('discovered_promotions')
        .delete()
        .eq('id', id)
      if (error) toast.error(error.message)
      else {
        toast.success(t('common.success', 'Excluído com sucesso'))
        fetchData()
      }
    } else if (action === 'publish') {
      if (
        !confirm(
          t(
            'common.confirm_publish',
            'Tem certeza que deseja publicar este item?',
          ),
        )
      )
        return
      const { error } = await supabase
        .from('discovered_promotions')
        .update({ status: 'Ativa' })
        .eq('id', id)
      if (error) toast.error(error.message)
      else {
        toast.success('Publicado com sucesso')
        fetchData()
      }
    } else if (action === 'edit') {
      setLoading(true)
      const { data: fullItem, error } = await supabase
        .from('discovered_promotions')
        .select('*')
        .eq('id', id)
        .single()
      setLoading(false)

      if (error) {
        toast.error('Erro ao carregar detalhes')
        return
      }

      setEditingItem(fullItem)
      setEditStatus(fullItem.status)
      setEditCategory(fullItem.category || '')
      setIsEditModalOpen(true)
    }
  }

  const getCategoryLabel = (catName: string) => {
    if (!catName) return '-'
    if (catName === 'General') return 'Geral'
    const found = dbCategories?.find((c: any) => c.name === catName)
    return found ? found.label : catName
  }

  const handleBulkEdit = () => {
    setEditingItem(null)
    setEditStatus('')
    setEditCategory('')
    setIsEditModalOpen(true)
  }

  const saveEdit = async () => {
    const updates: any = {}
    if (editStatus) updates.status = editStatus
    if (editCategory) updates.category = editCategory

    if (Object.keys(updates).length === 0) {
      setIsEditModalOpen(false)
      return
    }

    const ids = editingItem ? [editingItem.id] : Array.from(selectedIds)
    const { error } = await supabase
      .from('discovered_promotions')
      .update(updates)
      .in('id', ids)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Atualizado com sucesso')
      setIsEditModalOpen(false)
      fetchData()
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up h-full pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" />
            {t('admin.enrichment_hub.title', 'Hub de Enriquecimento')}
          </h2>
          <p className="text-slate-500 text-sm">
            {t(
              'admin.enrichment_hub.desc',
              'Gerencie campanhas de demonstração e enriqueça o sistema.',
            )}
          </p>
        </div>
        <Button
          onClick={() => setIsGeneratorOpen(true)}
          className="gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          {t('admin.generator.generate_button', 'Gerar Anúncios')}
        </Button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input
              placeholder={t('common.search', 'Buscar título...')}
              className="pl-9"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchData()}
            />
          </div>
          <div>
            <Select value={searchCategory} onValueChange={setSearchCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {dbCategories?.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal px-3',
                    !searchDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchDate
                    ? format(searchDate, 'dd/MM/yyyy')
                    : 'Data de Criação'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[100]">
                <Calendar
                  mode="single"
                  selected={searchDate}
                  onSelect={setSearchDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {searchDate && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 hover:bg-transparent"
                onClick={() => setSearchDate(undefined)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2 px-2">
            <Checkbox
              id="demoOnly"
              checked={demoOnly}
              onCheckedChange={(c) => setDemoOnly(!!c)}
            />
            <label
              htmlFor="demoOnly"
              className="text-sm font-medium cursor-pointer"
            >
              {t('admin.enrichment_hub.demo_only', 'Apenas Demonstração')}
            </label>
          </div>
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={fetchData}
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="bg-primary/5 border border-primary/20 p-3 rounded-md flex items-center justify-between mb-4 animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium text-primary">
              {selectedIds.size} selecionados
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkEdit}
                className="h-8"
              >
                <Edit className="w-4 h-4 mr-2" /> Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkPublish}
                className="h-8 text-green-700 hover:text-green-800"
              >
                <CheckCircle className="w-4 h-4 mr-2" /> Publicar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
                className="h-8"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Excluir
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto border rounded-md">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedIds.size === data.length && data.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Campanha</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                    {format(new Date(item.created_at), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.store_name} • {item.city || item.state || '-'}
                    </div>
                    {item.is_demo && (
                      <Badge
                        variant="outline"
                        className="text-[10px] mt-1 bg-slate-100 text-slate-500"
                      >
                        Demonstração
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{getCategoryLabel(item.category)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.status === 'Ativa' ? 'default' : 'secondary'
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSingleAction(item.id, 'edit')}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSingleAction(item.id, 'publish')}
                        title="Publicar"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSingleAction(item.id, 'delete')}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-slate-500"
                  >
                    {t('common.none', 'Nenhum item encontrado')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Generator Modal */}
      <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Gerador em Massa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-2">
            <p className="text-sm text-slate-500 mb-4">
              Crie múltiplos anúncios fictícios de uma vez. O status padrão será
              "Encerrada" por segurança e salvos como Descobertas.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Criação</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(genDate, 'dd/MM/yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[100]">
                    <Calendar
                      mode="single"
                      selected={genDate}
                      onSelect={(d) => d && setGenDate(d)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  value={genQty}
                  onChange={(e) => setGenQty(e.target.value)}
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={genCategory} onValueChange={setGenCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {dbCategories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.label}
                    </SelectItem>
                  ))}
                  {!dbCategories?.length && (
                    <SelectItem value="General">Geral</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nome da Loja (Opcional)</Label>
              <Input
                value={genStore}
                onChange={(e) => setGenStore(e.target.value)}
                placeholder="Deixe em branco para gerar automaticamente"
              />
            </div>

            <div className="space-y-2 pt-2">
              <Label>Localização Alvo</Label>
              <HierarchicalLocationSelector
                country={genCountry}
                state={genState}
                city={genCity}
                onChange={(c, s, ci) => {
                  setGenCountry(c)
                  setGenState(s)
                  setGenCity(ci)
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGeneratorOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {t('admin.generator.generate_button', 'Gerar Anúncios')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent
          className={
            editingItem ? 'max-w-3xl max-h-[90vh] flex flex-col' : 'max-w-sm'
          }
        >
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Promoção' : 'Edição em Massa'}
            </DialogTitle>
          </DialogHeader>

          {editingItem ? (
            <form
              id="full-edit-form"
              className="flex-1 overflow-hidden flex flex-col"
              onSubmit={async (e) => {
                e.preventDefault()
                const btn = document.getElementById(
                  'save-btn-submit',
                ) as HTMLButtonElement
                if (btn) btn.disabled = true

                try {
                  const formData = new FormData(e.currentTarget)
                  const updates = {
                    title: formData.get('title'),
                    description: formData.get('description'),
                    store_name: formData.get('store_name'),
                    image_url: formData.get('image_url'),
                    original_price: formData.get('original_price')
                      ? parseFloat(formData.get('original_price') as string)
                      : null,
                    price: formData.get('price')
                      ? parseFloat(formData.get('price') as string)
                      : null,
                    currency: formData.get('currency') || 'BRL',
                    product_link: formData.get('product_link'),
                    category: editCategory,
                    status: editStatus,
                    city: formData.get('city'),
                    state: formData.get('state'),
                  }

                  const itemId = editingItem.id
                  if (!itemId) throw new Error('ID não encontrado')

                  const { error } = await supabase
                    .from('discovered_promotions')
                    .update(updates)
                    .eq('id', itemId)

                  if (error) throw error

                  toast.success('Promoção atualizada com sucesso!')
                  setIsEditModalOpen(false)
                  fetchData()
                } catch (err: any) {
                  toast.error('Erro ao atualizar: ' + err.message)
                } finally {
                  if (btn) btn.disabled = false
                }
              }}
            >
              <div className="flex-1 overflow-y-auto pr-4 space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label>Título</Label>
                    <Input
                      name="title"
                      defaultValue={editingItem?.title || ''}
                      required
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      name="description"
                      defaultValue={editingItem?.description || ''}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Nome da Loja</Label>
                    <Input
                      name="store_name"
                      defaultValue={editingItem?.store_name || ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>URL da Imagem</Label>
                    <div className="flex gap-4">
                      {editingItem?.image_url && (
                        <div className="w-16 h-16 rounded overflow-hidden shrink-0 border border-slate-200">
                          <img
                            src={editingItem.image_url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <Input
                        name="image_url"
                        defaultValue={editingItem?.image_url || ''}
                        type="url"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Preço Original</Label>
                    <Input
                      name="original_price"
                      defaultValue={editingItem?.original_price || ''}
                      type="number"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preço Atual</Label>
                    <Input
                      name="price"
                      defaultValue={editingItem?.price || ''}
                      type="number"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Moeda</Label>
                    <Select
                      name="currency"
                      defaultValue={editingItem?.currency || 'BRL'}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">BRL (R$)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Link do Produto / Oferta</Label>
                    <Input
                      name="product_link"
                      defaultValue={
                        editingItem?.product_link ||
                        editingItem?.source_url ||
                        ''
                      }
                      type="url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={editStatus} onValueChange={setEditStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          Publicado (active)
                        </SelectItem>
                        <SelectItem value="pending">
                          Pendente (pending)
                        </SelectItem>
                        <SelectItem value="inactive">
                          Inativo (inactive)
                        </SelectItem>
                        <SelectItem value="rejected">
                          Rejeitado (rejected)
                        </SelectItem>
                        <SelectItem value="archived">
                          Arquivado (archived)
                        </SelectItem>
                        <SelectItem value="Ativa">Publicado (Ativa)</SelectItem>
                        <SelectItem value="Encerrada">
                          Encerrado (Encerrada)
                        </SelectItem>
                        <SelectItem value="Pausada">
                          Pausado (Pausada)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={editCategory}
                      onValueChange={setEditCategory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria..." />
                      </SelectTrigger>
                      <SelectContent>
                        {dbCategories?.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input name="city" defaultValue={editingItem?.city || ''} />
                  </div>

                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Input
                      name="state"
                      defaultValue={editingItem?.state || ''}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button id="save-btn-submit" type="submit">
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativa">Publicado (Ativa)</SelectItem>
                      <SelectItem value="Encerrada">
                        Encerrado (Encerrada)
                      </SelectItem>
                      <SelectItem value="Pausada">Pausado (Pausada)</SelectItem>
                      <SelectItem value="pending">
                        Pendente (pending)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria..." />
                    </SelectTrigger>
                    <SelectContent>
                      {dbCategories?.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={saveEdit}>Salvar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
