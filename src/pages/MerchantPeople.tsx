import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { useAuth } from '@/hooks/use-auth'
import { UserCog, Users, Shield, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCouponStore } from '@/stores/CouponContext'
import { toast } from 'sonner'

export default function MerchantPeople() {
  const { t } = useLanguage()
  const { user: authUser, profile } = useAuth()
  const { user, companies } = useCouponStore()

  const [myCompany, setMyCompany] = useState<any>(null)
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'manager',
  })
  const [adding, setAdding] = useState(false)

  const fetchStaff = async (companyId: string) => {
    if (companyId !== 'admin-global') {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', companyId)
        .order('name', { ascending: true })

      if (data && !error && data.length > 0) {
        setStaff(data)
      } else if (
        profile &&
        [
          'merchant',
          'shopkeeper',
          'manager',
          'supervisor',
          'attendant',
        ].includes(profile.role)
      ) {
        setStaff([profile])
      }
    } else {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('role', [
          'merchant',
          'shopkeeper',
          'manager',
          'supervisor',
          'attendant',
        ])
        .limit(10)
      if (data) setStaff(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    const resolveCompany = async () => {
      const found =
        companies.find((c) => c.id === user?.companyId) || companies[0]
      if (found) {
        setMyCompany(found)
        fetchStaff(found.id)
        return
      }
      if (authUser?.email) {
        const { data } = await supabase
          .from('merchants')
          .select('*')
          .eq('email', authUser.email)
          .maybeSingle()
        if (data) {
          setMyCompany(data)
          fetchStaff(data.id)
          return
        } else if (
          profile?.role === 'admin' ||
          profile?.role === 'super_admin'
        ) {
          const testCompany = {
            id: 'admin-global',
            name: 'Empresa Teste (Visão Admin) - Global',
          }
          setMyCompany(testCompany)
          fetchStaff('admin-global')
        }
      }
    }
    resolveCompany()
  }, [companies, user, authUser, profile])

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMember.email || !newMember.name)
      return toast.error(
        t('common.fill_required_fields', 'Please fill in all required fields'),
      )

    setAdding(true)
    try {
      const { data, error } = await supabase.functions.invoke(
        'send-invitation',
        {
          body: {
            email: newMember.email,
            name: newMember.name,
            role: newMember.role,
            company_id: myCompany?.id,
          },
        },
      )
      if (error) throw error
      if (data?.error) throw new Error(data.error)

      toast.success(
        t('team.member_added_success', 'Member added successfully!'),
      )
      setIsAddOpen(false)
      setNewMember({ name: '', email: '', role: 'manager' })
      if (myCompany) fetchStaff(myCompany.id)
    } catch (err: any) {
      toast.error(
        t('team.member_add_error', 'Error adding member: ') + err.message,
      )
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {t('merchant.people.title', 'Team Management')}
            </h1>
            <p className="text-slate-500">
              {myCompany?.name || t('common.loading', 'Loading...')}
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="font-semibold shadow-md bg-purple-600 hover:bg-purple-700 w-full sm:w-auto text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('team.add_member_title', 'Add New Member')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('team.total_members', 'Total Members')}
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {staff.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('team.admin_profiles', 'Admin Profiles')}
            </CardTitle>
            <Shield className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {
                staff.filter(
                  (s) =>
                    s.role === 'merchant' ||
                    s.role === 'manager' ||
                    s.role === 'admin' ||
                    s.role === 'super_admin',
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t('team.team_members', 'Team Members')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">
              {t('team.loading_team', 'Loading team...')}
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-8 text-slate-500 border border-dashed rounded-lg bg-slate-50">
              {t('team.no_members_found', 'No members found.')}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>{t('common.name', 'Name')}</TableHead>
                    <TableHead>{t('common.email', 'Email')}</TableHead>
                    <TableHead>{t('common.role', 'Role')}</TableHead>
                    <TableHead>{t('common.status', 'Status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.name || t('common.user', 'User')}
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 uppercase">
                          {t(`team.role.${member.role}`, member.role || 'user')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          {t('common.active', 'Active')}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t('team.add_member_title', 'Add New Member')}
            </DialogTitle>
            <DialogDescription>
              {t(
                'team.add_member_description',
                'This user will receive an email invitation and will be part of the current company.',
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('common.name', 'Name')}</Label>
              <Input
                id="name"
                value={newMember.name}
                onChange={(e) =>
                  setNewMember((p) => ({ ...p, name: e.target.value }))
                }
                placeholder={t('common.name_placeholder', 'Collaborator name')}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('common.email', 'Email')}</Label>
              <Input
                id="email"
                type="email"
                value={newMember.email}
                onChange={(e) =>
                  setNewMember((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.role', 'Role')}</Label>
              <Select
                value={newMember.role}
                onValueChange={(v) => setNewMember((p) => ({ ...p, role: v }))}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('common.select_role', 'Select role')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">
                    {t('team.role.manager', 'Manager')}
                  </SelectItem>
                  <SelectItem value="supervisor">
                    {t('team.role.supervisor', 'Supervisor')}
                  </SelectItem>
                  <SelectItem value="attendant">
                    {t('team.role.attendant', 'Attendant')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                type="submit"
                disabled={adding}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {adding
                  ? t('common.sending', 'Sending...')
                  : t('team.invite_button', 'Invite Member')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
