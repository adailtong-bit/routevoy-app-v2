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
  AlertCircle,
  Clock,
  MoreHorizontal,
  Ban,
  CheckCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  source: 'profile' | 'invitation'
}

export default function MerchantPeople() {
  const { t } = useLanguage()
  const { user: authUser, profile, loading: authLoading } = useAuth()

  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
  const hasProfile = !!profile
  const noCompany = hasProfile && !companyId && !isMaster

  const userRole = profile?.role?.toLowerCase()
  const canManage =
    isMaster ||
    [
      'merchant',
      'owner',
      'admin',
      'manager',
      'supervisor',
      'shopkeeper',
    ].includes(userRole || '')

  const fetchStaff = useCallback(async () => {
    if (!companyId && !isMaster) {
      setStaff([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let profilesData: any[] = []
      let invitationsData: any[] = []

      if (isMaster && !companyId) {
        const { data, error: err } = await supabase
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
        if (err) throw err
        profilesData = (data || []).map((p: any) => ({
          ...p,
          source: 'profile' as const,
        }))
      } else if (companyId) {
        const [profilesRes, invitationsRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('company_id', companyId)
            .order('name', { ascending: true }),
          supabase
            .from('user_invitations')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false }),
        ])

        if (profilesRes.error) throw profilesRes.error
        if (invitationsRes.error) throw invitationsRes.error

        profilesData = (profilesRes.data || []).map((p: any) => ({
          ...p,
          source: 'profile' as const,
        }))
        invitationsData = (invitationsRes.data || []).map((i: any) => ({
          id: i.id,
          name: null,
          email: i.email,
          role: i.role,
          status: i.status,
          source: 'invitation' as const,
        }))
      }

      setStaff([...profilesData, ...invitationsData] as StaffMember[])
    } catch (err: any) {
      setError(err.message || 'Failed to load team members')
      setStaff([])
    } finally {
      setLoading(false)
    }
  }, [companyId, isMaster])

  useEffect(() => {
    if (authLoading) return
    if (!authUser) {
      setLoading(false)
      return
    }
    if (!hasProfile) {
      setLoading(false)
      setError('profile_failed')
      return
    }
    fetchStaff()
  }, [authUser, authLoading, hasProfile, companyId, isMaster, fetchStaff])

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
            franchise_id: profile?.franchise_id || null,
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

  const handleToggleStatus = async (member: StaffMember) => {
    if (member.source === 'invitation') return
    const newStatus = member.status === 'active' ? 'suspended' : 'active'
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', member.id)
      if (error) throw error
      toast.success(
        t('team.status_update_success', 'Member status updated successfully!'),
      )
      fetchStaff()
    } catch (err: any) {
      toast.error(
        t('team.status_update_error', 'Error updating member status: ') +
          err.message,
      )
    }
  }

  const handleEditMember = async (data: {
    name: string
    email: string
    role: string
  }) => {
    if (!editTarget || editTarget.source === 'invitation') return
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
      if (deleteTarget.source === 'invitation') {
        const { error } = await supabase
          .from('user_invitations')
          .delete()
          .eq('id', deleteTarget.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({ company_id: null })
          .eq('id', deleteTarget.id)
        if (error) throw error
      }
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

  const adminRoles = [
    'merchant',
    'manager',
    'admin',
    'super_admin',
    'owner',
    'shopkeeper',
  ]
  const adminCount = staff.filter(
    (s) =>
      adminRoles.includes(s.role?.toLowerCase() || '') &&
      s.source === 'profile',
  ).length
  const showAddButton = canManage && (companyId || isMaster)

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sticky top-0 z-20 bg-slate-50/80 backdrop-blur-sm pb-4 -mx-4 px-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl flex-shrink-0">
            <UserCog className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-800">
              {t('merchant.people.title', 'Team Management')}
            </h1>
            <p className="text-slate-500 truncate">
              {profile?.email || t('common.loading', 'Loading...')}
            </p>
          </div>
        </div>
        {showAddButton && (
          <Button
            onClick={() => setIsAddOpen(true)}
            className="font-semibold shadow-md bg-purple-600 hover:bg-purple-700 w-full sm:w-auto text-white flex-shrink-0"
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
          ) : error === 'profile_failed' ? (
            <div className="text-center py-12 space-y-3">
              <AlertCircle className="w-12 h-12 text-red-300 mx-auto" />
              <h3 className="font-semibold text-slate-700">
                {t('team.profile_load_failed', 'Profile Not Loaded')}
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {t(
                  'team.profile_load_failed_desc',
                  'Failed to load your profile. Please refresh the page or contact support.',
                )}
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                {t('common.refresh', 'Refresh')}
              </Button>
            </div>
          ) : error && error !== 'profile_failed' ? (
            <div className="text-center py-12 space-y-3">
              <AlertCircle className="w-12 h-12 text-red-300 mx-auto" />
              <h3 className="font-semibold text-slate-700">
                {t('team.load_error', 'Error Loading Team')}
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">{error}</p>
              <Button
                variant="outline"
                onClick={() => fetchStaff()}
                className="mt-2"
              >
                {t('common.retry', 'Retry')}
              </Button>
            </div>
          ) : noCompany ? (
            <div className="text-center py-12 space-y-3">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-semibold text-slate-700">
                {t('team.setup_required', 'Store Not Linked')}
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
                {t('team.empty_team', 'No Team Members Found')}
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {t(
                  'team.empty_team_desc',
                  'No team members found. Add your first team member to get started.',
                )}
              </p>
              {showAddButton && (
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
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="min-w-[120px]">
                      {t('common.name', 'Name')}
                    </TableHead>
                    <TableHead className="min-w-[180px]">
                      {t('common.email', 'Email')}
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      {t('common.role', 'Role')}
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      {t('common.status', 'Status')}
                    </TableHead>
                    <TableHead className="min-w-[140px]">
                      {t('team.initial_password', 'Initial Password')}
                    </TableHead>
                    {canManage && (
                      <TableHead className="text-right min-w-[80px]">
                        {t('common.actions', 'Actions')}
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={`${member.source}-${member.id}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {member.source === 'invitation' && (
                            <Clock className="w-4 h-4 text-amber-500" />
                          )}
                          {member.name || t('common.user', 'User')}
                        </div>
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 uppercase">
                          {t(`team.role.${member.role}`, member.role || 'user')}
                        </span>
                      </TableCell>
                      <TableCell>
                        {member.source === 'invitation' ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            {t('team.pending', 'Pending')}
                          </span>
                        ) : member.status === 'suspended' ||
                          member.status === 'inactive' ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            {t('team.suspended', 'Suspended')}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            {t('common.active', 'Active')}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.source === 'invitation' ? (
                          <span className="text-xs text-slate-400 italic">
                            {t('team.invitation_sent', 'Invitation sent')}
                          </span>
                        ) : (
                          <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-600">
                            ChangeMe123!
                          </span>
                        )}
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Actions"
                                >
                                  <MoreHorizontal className="w-4 h-4 text-slate-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {member.source === 'profile' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditTarget(member)
                                        setIsEditOpen(true)
                                      }}
                                    >
                                      <Pencil className="w-4 h-4 mr-2" />
                                      {t('common.edit', 'Edit')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleToggleStatus(member)}
                                    >
                                      {member.status === 'active' ? (
                                        <>
                                          <Ban className="w-4 h-4 mr-2 text-amber-500" />
                                          {t('common.suspend', 'Suspend')}
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                                          {t('common.activate', 'Activate')}
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => setDeleteTarget(member)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {t('common.delete', 'Delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
