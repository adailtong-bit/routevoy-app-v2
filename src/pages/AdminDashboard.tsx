import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminPerformanceTab } from '@/components/admin/AdminPerformanceTab'
import { AdminHierarchyTab } from '@/components/admin/AdminHierarchyTab'
import { AdminApprovalsTab } from '@/components/admin/AdminApprovalsTab'
import { AdminOffersTab } from '@/components/admin/AdminOffersTab'
import { AdminCurrentAccountTab } from '@/components/admin/AdminCurrentAccountTab'
import { AdminSettingsTab } from '@/components/admin/AdminSettingsTab'
import { AdminAffiliatesTab } from '@/components/admin/AdminAffiliatesTab'
import { AdminCategoriesTab } from '@/components/admin/AdminCategoriesTab'
import { AdminCRM } from '@/components/admin/AdminCRM'
import { AdminAdsManager } from '@/components/admin/AdminAdsManager'
import {
  Shield,
  LayoutDashboard,
  Users,
  CheckSquare,
  Tag,
  FolderTree,
  Briefcase,
  Megaphone,
  MessageSquare,
  CreditCard,
  Settings,
} from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('offers')

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b border-gray-200 px-6 py-8 mb-8">
        <div className="container mx-auto flex items-center gap-4">
          <div className="p-4 bg-blue-600 text-white rounded-xl shadow-sm">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Painel do Administrador
            </h1>
            <p className="text-gray-500 mt-1">
              Visão global, gestão de ofertas e controle absoluto da plataforma
              ROUTEVOY
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="flex flex-wrap gap-2 h-auto bg-white p-2 rounded-xl shadow-sm border border-gray-100">
            <TabsTrigger
              value="performance"
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <LayoutDashboard className="w-4 h-4" /> Performance
            </TabsTrigger>
            <TabsTrigger
              value="hierarchy"
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Users className="w-4 h-4" /> Franquias & Lojistas
            </TabsTrigger>
            <TabsTrigger
              value="approvals"
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <CheckSquare className="w-4 h-4" /> Aprovações
            </TabsTrigger>
            <TabsTrigger
              value="offers"
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Tag className="w-4 h-4" /> Ofertas e Campanhas
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <FolderTree className="w-4 h-4" /> Categorias
            </TabsTrigger>
            <TabsTrigger
              value="affiliates"
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Briefcase className="w-4 h-4" /> Afiliados
            </TabsTrigger>
            <TabsTrigger
              value="ads"
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Megaphone className="w-4 h-4" /> Publicidade
            </TabsTrigger>
            <TabsTrigger
              value="crm"
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <MessageSquare className="w-4 h-4" /> CRM
            </TabsTrigger>
            <TabsTrigger
              value="financial"
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <CreditCard className="w-4 h-4" /> Financeiro
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Settings className="w-4 h-4" /> Configurações
            </TabsTrigger>
          </TabsList>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
            <TabsContent value="performance" className="m-0">
              <AdminPerformanceTab />
            </TabsContent>
            <TabsContent value="hierarchy" className="m-0">
              <AdminHierarchyTab />
            </TabsContent>
            <TabsContent value="approvals" className="m-0">
              <AdminApprovalsTab />
            </TabsContent>
            <TabsContent value="offers" className="m-0">
              <AdminOffersTab />
            </TabsContent>
            <TabsContent value="categories" className="m-0">
              <AdminCategoriesTab />
            </TabsContent>
            <TabsContent value="affiliates" className="m-0">
              <AdminAffiliatesTab />
            </TabsContent>
            <TabsContent value="ads" className="m-0">
              <AdminAdsManager />
            </TabsContent>
            <TabsContent value="crm" className="m-0">
              <AdminCRM />
            </TabsContent>
            <TabsContent value="financial" className="m-0">
              <AdminCurrentAccountTab />
            </TabsContent>
            <TabsContent value="settings" className="m-0">
              <AdminSettingsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
