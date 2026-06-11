import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || ''
      const errorName = this.state.error?.name || ''

      const isStorageError =
        errorName === 'SecurityError' ||
        errorMsg.includes('localStorage') ||
        errorMsg.includes('Access is denied') ||
        errorMsg.includes('quota')

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50/50 p-4 w-full">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {isStorageError
                ? 'Acesso Restrito ao Navegador'
                : 'Ops, algo deu errado!'}
            </h2>
            <p className="text-slate-600 mb-8 text-sm leading-relaxed">
              {isStorageError
                ? 'Seu navegador está bloqueando o acesso aos cookies ou ao armazenamento local (geralmente causado por modo anônimo ou nível alto de privacidade). Por favor, permita o acesso para o site funcionar corretamente.'
                : 'Tivemos um problema inesperado ao processar os dados desta tela. Você pode tentar recarregar ou voltar para a página inicial.'}
            </p>

            {process.env.NODE_ENV === 'development' && !isStorageError && (
              <div className="mb-6 p-4 bg-slate-100 rounded-lg text-left overflow-auto max-h-32 text-xs text-slate-700 font-mono">
                <strong>{errorName}</strong>: {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-3 w-full">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
                className="w-full font-semibold shadow-sm"
                size="lg"
              >
                Tentar Novamente
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.href = '/'
                }}
                className="w-full font-semibold shadow-sm"
                size="lg"
              >
                Voltar ao Início
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
