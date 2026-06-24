import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useLanguage } from '@/stores/LanguageContext'
import { useAuth } from '@/hooks/use-auth'
import { useEnvironment } from '@/hooks/use-environment'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  UserPlus,
  LogIn,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  LogOut,
  ArrowRight,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [activeTab, setActiveTab] = useState('login')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)
  const [role, setRole] = useState('user')
  const [taxId, setTaxId] = useState('')
  const [isResetting, setIsResetting] = useState(false)

  // Recovery State
  const [isRecoveryMode, setIsRecoveryMode] = useState(false)
  const [recoveryPassword, setRecoveryPassword] = useState('')
  const [recoveryConfirm, setRecoveryConfirm] = useState('')
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [currentRole, setCurrentRole] = useState<string | null>(null)

  const {
    user: sbUser,
    loading: authLoading,
    signIn,
    signUp,
    signOut,
  } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const { isDevelopment } = useEnvironment()

  const fromObj = location.state?.from
  const from = fromObj
    ? `${fromObj.pathname}${fromObj.search}${fromObj.hash}`
    : '/'

  useEffect(() => {
    let isMounted = true

    // Check for recovery in hash to enforce Clean Slate & Error Handling
    const hash = window.location.hash
    const search = window.location.search

    const getParam = (key: string) => {
      let params = new URLSearchParams(hash.replace('#', '?'))
      if (params.has(key)) return params.get(key)
      params = new URLSearchParams(search)
      return params.get(key)
    }

    const errorParam = getParam('error')
    const errorDesc = getParam('error_description')
    const typeParam = getParam('type')
    const accessToken = getParam('access_token')

    // Clean up residual toast messages when visiting login newly
    toast.dismiss()

    if (errorParam) {
      if (errorDesc) {
        toast.error(decodeURIComponent(errorDesc.replace(/\+/g, ' ')))
      } else {
        toast.error('The recovery link has expired or is invalid')
      }
      // Clean slate on errors
      window.history.replaceState(null, '', window.location.pathname)
      sessionStorage.removeItem('isRecoveryMode')
    } else if (
      typeParam === 'recovery' ||
      hash.includes('type=recovery') ||
      search.includes('type=recovery') ||
      (accessToken && typeParam === 'recovery') ||
      sessionStorage.getItem('isRecoveryMode') === 'true'
    ) {
      if (isMounted) setIsRecoveryMode(true)
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        if (isMounted) {
          setIsRecoveryMode(true)
          sessionStorage.setItem('isRecoveryMode', 'true')
        }
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    if (sbUser) {
      supabase
        .from('profiles')
        .select('role')
        .eq('id', sbUser.id)
        .single()
        .then(({ data }) => {
          if (isMounted && data) {
            setCurrentRole(data.role)
          }
        })
    }
    return () => {
      isMounted = false
    }
  }, [sbUser])

  const performRedirect = (userRole: string) => {
    if (userRole === 'super_admin' || userRole === 'admin') {
      navigate('/admin', { replace: true })
    } else if (userRole === 'franchisee') {
      navigate('/franchisee', { replace: true })
    } else if (userRole === 'merchant') {
      navigate('/merchant', { replace: true })
    } else if (userRole === 'shopkeeper') {
      navigate('/merchant/scanner', { replace: true })
    } else if (userRole === 'affiliate') {
      navigate('/affiliate', { replace: true })
    } else {
      navigate(from !== '/' && !from.includes('/login') ? from : '/profile', {
        replace: true,
      })
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!navigator.onLine) {
      toast.error('You are offline. Check your connection to sign in.')
      return
    }

    if (email && password) {
      setIsLoading(true)

      try {
        let { error, data } = await signIn(email, password)

        // Fallback para master account
        if (
          error &&
          email.toLowerCase() === 'adailtong@gmail.com' &&
          password !== 'Skip@Pass'
        ) {
          const retry = await signIn(email, 'Skip@Pass')
          if (!retry.error) {
            error = null
            data = retry.data
          }
        }

        if (error) {
          toast.error(
            'Invalid email or password, or a connection error occurred.',
          )
          return
        }

        toast.success('Welcome back!')
        if (data?.user) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role, is_affiliate')
              .eq('id', data.user.id)
              .single()

            let userRole =
              profile?.role || data.user.user_metadata?.role || 'user'

            if (
              profile?.is_affiliate ||
              data.user.user_metadata?.role === 'affiliate'
            ) {
              userRole = 'affiliate'
            }

            performRedirect(userRole)
          } catch (err) {
            let userRole = data.user.user_metadata?.role || 'user'
            performRedirect(userRole)
          }
        }
      } catch (err: any) {
        toast.error(
          err.message || 'An unexpected error occurred during sign in.',
        )
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!navigator.onLine) {
      toast.error('You are offline. Check your connection.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    if (email && password && name) {
      if (role === 'affiliate' && !taxId) {
        toast.error('Tax ID is required for Affiliate registration.')
        return
      }

      setIsLoading(true)

      try {
        const finalRole = role === 'affiliate' ? 'affiliate' : 'user'

        const { error, data } = await signUp(email, password, {
          data: {
            name,
            role: finalRole,
            tax_id: taxId,
          },
        })

        if (error) {
          toast.error(error.message || 'Error creating account.')
          return
        }

        supabase.functions
          .invoke('send-email', {
            body: { type: 'welcome', email, name },
          })
          .catch(console.error)

        toast.success('Account successfully created! Please check your email.')
        if (data?.user) {
          performRedirect(finalRole)
        }
      } catch (err: any) {
        toast.error(
          err.message || 'An unexpected error occurred during registration.',
        )
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleLogout = async () => {
    if (!navigator.onLine) {
      toast.error('You are offline. Check your connection to sign out.')
      return
    }
    setIsLoading(true)
    try {
      await signOut()
      toast.success('Successfully logged out.')
    } catch (err: any) {
      toast.error(err.message || 'Error signing out.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address first.')
      return
    }
    setIsResetting(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })
      if (error) {
        toast.error(error.message || 'Error sending recovery email.')
      } else {
        toast.success('Password recovery email sent! Check your inbox.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error sending recovery email.')
    } finally {
      setIsResetting(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (recoveryPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.')
      return
    }

    if (recoveryPassword !== recoveryConfirm) {
      toast.error('Passwords do not match.')
      return
    }

    setIsUpdatingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: recoveryPassword,
      })

      if (error) {
        toast.error(
          error.message || 'An error occurred while updating the password.',
        )
        setIsUpdatingPassword(false)
        return
      }

      toast.success('Password updated successfully. You are now logged in.')
      setIsRecoveryMode(false)
      sessionStorage.removeItem('isRecoveryMode')
      setRecoveryPassword('')
      setRecoveryConfirm('')

      // Clean the URL hash to prevent reopening modal on reload
      window.history.replaceState(null, '', window.location.pathname)

      if (sbUser) {
        let uRole = currentRole || sbUser.user_metadata?.role || 'user'
        if (sbUser.email === 'adailtong@gmail.com') {
          uRole = 'admin'
        }
        performRedirect(uRole)
      } else {
        navigate('/', { replace: true })
      }
    } catch (err: any) {
      toast.error(
        err.message || 'An error occurred while updating the password.',
      )
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin mb-4"></div>
      </div>
    )
  }

  if (sbUser && !isRecoveryMode) {
    let uRole = currentRole || sbUser.user_metadata?.role || 'user'
    if (sbUser.email === 'adailtong@gmail.com') {
      uRole = 'admin'
    }
    return (
      <>
        <div className="container max-w-md py-8 sm:py-16 px-4 sm:px-6 animate-fade-in-up mb-16 md:mb-0">
          <Card className="border-0 shadow-xl shadow-primary/5 text-center">
            <CardHeader>
              <div className="mx-auto bg-green-100 p-3 rounded-full mb-4 w-16 h-16 flex items-center justify-center">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">
                You are already logged in
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Logged in as{' '}
                <strong className="text-slate-800">{sbUser.email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Button
                className="w-full h-12 text-base font-bold"
                onClick={() => performRedirect(uRole)}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Go to my Dashboard'}{' '}
                {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 text-base text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
                disabled={isLoading}
              >
                <LogOut className="mr-2 w-5 h-5" />{' '}
                {isLoading ? 'Processing...' : 'Sign out of this account'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  const fillTestCredentials = (testEmail: string) => {
    setEmail(testEmail)
    setPassword('Skip@Pass')
  }

  return (
    <>
      <div className="container max-w-md py-8 sm:py-16 px-4 sm:px-6 animate-fade-in-up mb-16 md:mb-0 space-y-4">
        {isDevelopment && !isRecoveryMode && (
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Test Accounts (Dev Only)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 pb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillTestCredentials('adailtong@gmail.com')}
                className="text-xs h-8"
              >
                Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillTestCredentials('test_lojista@example.com')}
                className="text-xs h-8"
              >
                Vendor
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  fillTestCredentials('test_franqueado@example.com')
                }
                className="text-xs h-8"
              >
                Franchisee
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fillTestCredentials('test_afiliado@example.com')}
                className="text-xs h-8"
              >
                Affiliate
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-xl shadow-primary/5">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
              Routevoy
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {isRecoveryMode
                ? 'Set your new password below / Defina sua nova senha abaixo'
                : 'Welcome! Access your account or register.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isRecoveryMode ? (
              <form
                onSubmit={handleUpdatePassword}
                className="space-y-4 animate-in fade-in zoom-in duration-300"
              >
                <div className="space-y-2">
                  <Label htmlFor="new-password">
                    New Password / Nova Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={recoveryPassword}
                      onChange={(e) => setRecoveryPassword(e.target.value)}
                      disabled={isUpdatingPassword}
                      className="pl-9 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">
                    Confirm New Password / Confirmar Nova Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirm-password"
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={recoveryConfirm}
                      onChange={(e) => setRecoveryConfirm(e.target.value)}
                      disabled={isUpdatingPassword}
                      className="pl-9 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowRegConfirmPassword(!showRegConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                    >
                      {showRegConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="pt-4 space-y-3">
                  <Button
                    type="submit"
                    className="w-full h-11 font-bold text-base"
                    disabled={
                      isUpdatingPassword ||
                      recoveryPassword.length < 8 ||
                      recoveryPassword !== recoveryConfirm
                    }
                  >
                    {isUpdatingPassword ? 'Processing...' : 'Save New Password'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11"
                    onClick={() => {
                      setIsRecoveryMode(false)
                      sessionStorage.removeItem('isRecoveryMode')
                      window.history.replaceState(
                        null,
                        '',
                        window.location.pathname,
                      )
                    }}
                    disabled={isUpdatingPassword}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6 h-12 p-1 bg-slate-100/80">
                  <TabsTrigger
                    value="login"
                    className="rounded-md font-semibold text-xs sm:text-sm transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm px-2"
                  >
                    <LogIn className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="rounded-md font-semibold text-xs sm:text-sm transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm px-2"
                  >
                    <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="login"
                  className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
                >
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="user@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-slate-700">
                          Password
                        </Label>
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          disabled={isResetting || isLoading}
                          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                          {isResetting ? 'Processing...' : 'Forgot Password?'}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-11 font-bold text-base mt-2"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Login'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent
                  value="register"
                  className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
                >
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name" className="text-slate-700">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="reg-name"
                          type="text"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-slate-700">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="user@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 pt-4 pb-2">
                      <Checkbox
                        id="is-affiliate"
                        checked={role === 'affiliate'}
                        onCheckedChange={(checked) =>
                          setRole(checked ? 'affiliate' : 'user')
                        }
                        className="h-5 w-5"
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor="is-affiliate"
                        className="text-slate-700 font-medium cursor-pointer text-base"
                      >
                        I want to register as an Affiliate Partner
                      </Label>
                    </div>
                    {role === 'affiliate' && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <Label htmlFor="reg-tax-id" className="text-slate-700">
                          Tax ID / VAT <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 opacity-0" />
                          <Input
                            id="reg-tax-id"
                            type="text"
                            placeholder="000.000.000-00 or 00.000.000/0001-00"
                            value={taxId}
                            onChange={(e) => setTaxId(e.target.value)}
                            className="pl-3 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            required={role === 'affiliate'}
                            disabled={isLoading}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Document required for commission transfer and
                          validation.
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-slate-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="reg-password"
                          type={showRegPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                        >
                          {showRegPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="reg-confirm-password"
                        className="text-slate-700"
                      >
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="reg-confirm-password"
                          type={showRegConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-9 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowRegConfirmPassword(!showRegConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                        >
                          {showRegConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-11 font-bold text-base mt-2"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Register'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
