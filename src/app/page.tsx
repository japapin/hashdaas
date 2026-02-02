'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis, Legend, ResponsiveContainer, Tooltip } from 'recharts'
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Package, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DashboardData {
  resumo: {
    totalFaturamento: number
    totalCusto: number
    totalLucro: number
    margemMedia: number
    totalVendas: number
  }
  porProduto: Array<{
    produto: string
    faturamento: number
    custo: number
    lucro: number
    quantidade: number
  }>
  porMes: Array<{
    mes: string
    faturamento: number
    custo: number
    lucro: number
  }>
  porCondicao: Array<{
    condicao: string
    faturamento: number
    lucro: number
    quantidade: number
  }>
}

const COLORS = ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#D2B48C', '#F4A460', '#BC8F8F']

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const { toast } = useToast()

  const handleClearData = async () => {
    if (!confirm('Tem certeza que deseja apagar TODOS os dados do banco de dados?')) {
      return
    }

    try {
      setClearing(true)
      const response = await fetch('/api/clear-deleted?confirmacao=limpar-dados-deletados', {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erro ao limpar dados')
      const result = await response.json()

      toast({
        title: 'Dados limpos',
        description: result.message,
      })

      // Recarregar dados
      await fetchData()
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: 'Erro ao limpar dados',
        description: 'Não foi possível limpar os dados',
        variant: 'destructive',
      })
    } finally {
      setClearing(false)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/dashboard?${params.toString()}`, {
        cache: 'no-store'
      })
      if (!response.ok) throw new Error('Erro ao buscar dados')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados do dashboard',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    try {
      setSyncing(true)
      const response = await fetch('/api/sync-sales', {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Erro ao sincronizar')
      const result = await response.json()
      toast({
        title: 'Sincronização concluída',
        description: result.message,
      })

      // Forçar atualização dos dados
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 100))
      await fetchData()
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: 'Erro ao sincronizar',
        description: 'Não foi possível sincronizar os dados do Google Sheets',
        variant: 'destructive',
      })
    } finally {
      setSyncing(false)
    }
  }

  const clearFilters = () => {
    setStartDate('')
    setEndDate('')
  }

  useEffect(() => {
    fetchData()
  }, [startDate, endDate])

  // Sincronizar automaticamente ao carregar a página
  useEffect(() => {
    const autoSyncOnMount = async () => {
      try {
        const response = await fetch('/api/sync-sales', {
          method: 'POST',
        })
        const result = await response.json()
        console.log('Auto-sync:', result)
      } catch (error) {
        console.error('Erro ao sincronizar automaticamente:', error)
      }
    }

    // Executar apenas na primeira carga, ignorando se já foi executado
    const hasAutoSynced = sessionStorage.getItem('autoSynced')
    if (!hasAutoSynced) {
      autoSyncOnMount()
      sessionStorage.setItem('autoSynced', 'true')
    }
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/logo.jpg" 
                alt="Urban Country Store Logo" 
                className="h-16 w-auto rounded-lg"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Urban Country Store
                </h1>
                <p className="text-slate-400 text-sm">Sistema de Controle de Vendas</p>
              </div>
            </div>

            {/* Sincronizar e Limpar Dados */}
            <div className="flex gap-2">
              <Button
                onClick={handleSync}
                disabled={syncing}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
              <Button
                onClick={handleClearData}
                disabled={syncing}
                variant="outline"
                className="border-slate-700 text-slate-400 hover:bg-slate-800"
              >
                Limpar Dados
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="mb-6 bg-slate-900/50 backdrop-blur shadow-lg border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5 text-amber-500" />
              Filtrar por Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="startDate" className="text-slate-400">Data Inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 bg-slate-800 border-slate-700 text-white focus:ring-amber-500"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="endDate" className="text-slate-400">Data Final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 bg-slate-800 border-slate-700 text-white focus:ring-amber-500"
                />
              </div>
              <Button onClick={clearFilters} variant="outline" className="border-slate-700 text-slate-400 hover:bg-slate-800">
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-amber-500" />
              <p className="text-slate-400 font-medium">Carregando dados...</p>
            </div>
          </div>
        ) : data && data.resumo.totalVendas > 0 ? (
          <>
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-slate-900 border border-slate-800 text-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Faturamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(data.resumo.totalFaturamento)}</p>
                      <p className="text-slate-400 text-sm mt-1">{data.resumo.totalVendas} vendas</p>
                    </div>
                    <DollarSign className="w-10 h-10 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border border-slate-800 text-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Custo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(data.resumo.totalCusto)}</p>
                      <p className="text-slate-400 text-sm mt-1">Custo total</p>
                    </div>
                    <TrendingDown className="w-10 h-10 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border border-slate-800 text-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Lucro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(data.resumo.totalLucro)}</p>
                      <p className="text-slate-400 text-sm mt-1">Lucro líquido</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border border-slate-800 text-white shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Margem Média</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{data.resumo.margemMedia.toFixed(1)}%</p>
                      <p className="text-slate-400 text-sm mt-1">Margem de lucro</p>
                    </div>
                    <Calendar className="w-10 h-10 text-amber-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Gráfico de Faturamento por Mês */}
              <Card className="bg-slate-900 border border-slate-800 text-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Faturamento por Mês</CardTitle>
                  <CardDescription className="text-slate-400">Evolução do faturamento, custo e lucro ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.porMes}>
                      <XAxis dataKey="mes" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                        contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="faturamento" stroke="#22c55e" name="Faturamento" strokeWidth={2} />
                      <Line type="monotone" dataKey="custo" stroke="#ef4444" name="Custo" strokeWidth={2} />
                      <Line type="monotone" dataKey="lucro" stroke="#10b981" name="Lucro" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico de Faturamento por Produto */}
              <Card className="bg-slate-900 border border-slate-800 text-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Top 10 Produtos</CardTitle>
                  <CardDescription className="text-slate-400">Produtos com maior faturamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.porProduto.slice(0, 10)} layout="vertical">
                      <XAxis type="number" stroke="#94a3b8" />
                      <YAxis dataKey="produto" type="category" width={150} stroke="#94a3b8" />
                      <Tooltip 
                        formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                        contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar dataKey="faturamento" fill="#22c55e" name="Faturamento" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico de Faturamento por Condição */}
              <Card className="bg-slate-900 border border-slate-800 text-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Faturamento por Condição</CardTitle>
                  <CardDescription className="text-slate-400">Distribuição por condição de venda</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.porCondicao}
                        dataKey="faturamento"
                        nameKey="condicao"
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ condicao, percent }) => `${condicao} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                      >
                        {data.porCondicao.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                        contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico de Lucro por Produto */}
              <Card className="bg-slate-900 border border-slate-800 text-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Lucro por Produto</CardTitle>
                  <CardDescription className="text-slate-400">Produtos com maior lucro</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.porProduto.slice(0, 10)}>
                      <XAxis dataKey="produto" stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                        contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar dataKey="lucro" fill="#10b981" name="Lucro" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

          </>
        ) : (
          <Card className="bg-slate-900 border border-slate-800 text-white">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <Package className="w-16 h-16 text-slate-600 mb-4" />
              <p className="text-slate-400 font-medium text-lg">Nenhum dado disponível</p>
              <p className="text-slate-600 text-sm mt-2">
                {loading ? 'Carregando dados...' : 'Adicione dados na planilha do Google Sheets e clique em "Sincronizar"'}
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-white mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-slate-400">
            <p className="font-semibold text-white">Urban Country Store - Sistema de Controle de Vendas</p>
            <p className="text-sm mt-1">© {new Date().getFullYear()} Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
