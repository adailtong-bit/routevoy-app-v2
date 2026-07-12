import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/stores/LanguageContext'
import { useAuth } from '@/hooks/use-auth'
import {
  UserCog,
  Users,
  Shield,
  Plus,
  Pencil,
  Trash2,
  Building2,
} from 'lucide-react'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MemberFormDialog } from '@/components/merchant/MemberFormDialog'
import { toast } from 'sonner'

interface StaffMember {
  id: string
  name: string | null
  email: string
  role: string | null
  status: string | null
}

export default function MerchantPeople() {
  const { t } = useLanguage()
  const { user: authUser, profile } = useAuth()

  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null)
  const [deleting, setDeleting] = useState(false)

  const companyId = profile?.company_id || null
  const isMaster =
    profile?.role === 'admin' ||
    profile?.role === 'super_admin' ||
    profile?.email?.toLowerCase() === 'adailtong@gmail.com'

  const fetchStaff = useCallback(async () => {
    if (!companyId && !isMaster) {
      setStaff([])
      setLoading(false)
      return
    }

    try {
      if (isMaster && !companyId) {
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
          .limit(20)
          .order('name', { ascending: true })
        setStaff((data || []) as StaffMember[])
      } else if (companyId) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('company_id', companyId)
          .order('name', { ascending: true })

        if (data && !error && data.length > 0) {
          setStaff(data as StaffMember[])
        } else if (profile) {
          setStaff([profile as StaffMember])
        } else {
          setStaff([])
        }
      } else {
        setStaff([])
      }
    } catch (err) {
      setStaff([])
    } finally {
      setLoading(false)
    }
  }, [companyId, isMaster, profile])

  useEffect(() => {
    if (profile !== undefined) {
      fetchStaff()
    } else if (!authUser) {
      setLoading(false)
    }
  }, [profile, authUser, fetchStaff])

  const handleAddMember = async (data: {
    name: string
    email: string
    role: string
  }) => {
    if (!data.email || !data.name) {
      return toast.error(
        t('common.fill_required_fields', 'Please fill in all required fields'),
      )
    }
    setAdding(true)
    try {
      const { data: result, error } = await supabase.functions.invoke(
        'send-invitation',
        {
          body: {
            email: data.email,
            name: data.name,
            role: data.role,
            company_id: companyId,
          },
        },
      )
      if (error) throw error
      if (result?.error) throw new Error(result.error)
      toast.success(
        t('team.member_added_success', 'Member added successfully!'),
      )
      setIsAddOpen(false)
      fetchStaff()
    } catch (err: any) {
      toast.error(
        t('team.member_add_error', 'Error adding member: ') + err.message,
      )
    } finally {
      setAdding(false)
    }
  }

  const handleEditMember = async (data: {
    name: string
    email: string
    role: string
  }) => {
    if (!editTarget) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: data.name, role: data.role })
        .eq('id', editTarget.id)
      if (error) throw error
      toast.success(t('team.edit_success', 'Member updated successfully!'))
      setIsEditOpen(false)
      setEditTarget(null)
      fetchStaff()
    } catch (err: any) {
      toast.error(t('team.edit_error', 'Error updating member: ') + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMember = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ company_id: null })
        .eq('id', deleteTarget.id)
      if (error) throw error
      toast.success(
        t('team.delete_success', 'Member removed from team successfully!'),
      )
      setDeleteTarget(null)
      fetchStaff()
    } catch (err: any) {
      toast.error(
        t('team.delete_error', 'Error removing member: ') + err.message,
      )
    } finally {
      setDeleting(false)
    }
  }

  const adminRoles = ['merchant', 'manager', 'admin', 'super_admin']
  const adminCount = staff.filter((s) =>
    adminRoles.includes(s.role || ''),
  ).length
  const canManage =
    isMaster ||
    profile?.role === 'merchant' ||
    profile?.role === 'manager' ||
    profile?.role === 'supervisor'

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
              {profile?.email || t('common.loading', 'Loading...')}
            </p>
          </div>
        </div>
        {canManage && companyId && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="font-semibold shadow-md bg-purple-600 hover:bg-purple-700 w-full sm:w-auto text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('team.add_member_title', 'Add New Member')}
          </Button>
        )}
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
              {adminCount}
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
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : !companyId && !isMaster ? (
            <div className="text-center py-12 space-y-3">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-semibold text-slate-700">
                {t('team.setup_required', 'Setup Required')}
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {t(
                  'team.no_company_desc',
                  'Your profile is not linked to a store. Please contact your administrator to be assigned to a company.',
                )}
              </p>
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-semibold text-slate-700">
                {t('team.empty_team', 'Empty Team')}
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {t(
                  'team.empty_team_desc',
                  'No team members found. Add your first team member to get started.',
                )}
              </p>
              {canManage && companyId && (
                <Button
                  onClick={() => setIsAddOpen(true)}
                  className="mt-2 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('team.add_member_title', 'Add New Member')}
                </Button>
              )}
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
                    <TableHead>
                      {t('team.initial_password', 'Initial Password')}
                    </TableHead>
                    {canManage && (
                      <TableHead className="text-right">
                        {t('common.actions', 'Actions')}
                      </TableHead>
                    )}
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
                      <TableCell>
                        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-600">
                          ChangeMe123!
                        </span>
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditTarget(member)
                                setIsEditOpen(true)
                              }}
                              aria-label={t('team.edit_button', 'Edit')}
                            >
                              <Pencil className="w-4 h-4 text-slate-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTarget(member)}
                              aria-label={t('team.delete_button', 'Delete')}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <MemberFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        mode="add"
        onSubmit={handleAddMember}
        submitting={adding}
      />

      <MemberFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        mode="edit"
        member={editTarget}
        onSubmit={handleEditMember}
        submitting={saving}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('team.delete_confirm_title', 'Remove Team Member')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'team.delete_confirm_desc',
                'Are you sure you want to remove this member from your team? They will lose access to the company dashboard.',
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('common.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting
                ? t('common.sending', 'Removing...')
                : t('team.delete_button', 'Remove Member')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
