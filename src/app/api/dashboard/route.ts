import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    console.log('=== DASHBOARD API CHAMADA ===')

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    console.log('Filtros:', { startDate, endDate })

    // Filtro por período
    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.gte = new Date(startDate)
      dateFilter.lte = new Date(endDate)
    } else if (startDate) {
      dateFilter.gte = new Date(startDate)
    } else if (endDate) {
      dateFilter.lte = new Date(endDate)
    }

    const whereClause = Object.keys(dateFilter).length > 0 ? { data: dateFilter } : {}

    // Buscar todas as vendas
    const vendas = await db.venda.findMany({
      where: whereClause,
      orderBy: { data: 'asc' },
    })

    console.log(`Vendas encontradas: ${vendas.length}`)

    // Calcular métricas gerais
    const totalFaturamento = vendas.reduce((sum, v) => sum + v.faturamento, 0)
    const totalCusto = vendas.reduce((sum, v) => sum + v.custo, 0)
    const totalLucro = vendas.reduce((sum, v) => sum + v.lucro, 0)
    const margemMedia = totalFaturamento > 0 ? (totalLucro / totalFaturamento) * 100 : 0

    // Agrupar por produto
    const porProduto: Record<string, { faturamento: number; custo: number; lucro: number; quantidade: number }> = {}
    for (const venda of vendas) {
      if (!porProduto[venda.produto]) {
        porProduto[venda.produto] = { faturamento: 0, custo: 0, lucro: 0, quantidade: 0 }
      }
      porProduto[venda.produto].faturamento += venda.faturamento
      porProduto[venda.produto].custo += venda.custo
      porProduto[venda.produto].lucro += venda.lucro
      porProduto[venda.produto].quantidade += 1
    }

    const produtosData = Object.entries(porProduto).map(([produto, data]) => ({
      produto,
      faturamento: data.faturamento,
      custo: data.custo,
      lucro: data.lucro,
      quantidade: data.quantidade,
    })).sort((a, b) => b.faturamento - a.faturamento)

    // Agrupar por mês
    const porMes: Record<string, { faturamento: number; custo: number; lucro: number }> = {}
    for (const venda of vendas) {
      const month = venda.data.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' })
      if (!porMes[month]) {
        porMes[month] = { faturamento: 0, custo: 0, lucro: 0 }
      }
      porMes[month].faturamento += venda.faturamento
      porMes[month].custo += venda.custo
      porMes[month].lucro += venda.lucro
    }

    const mesesData = Object.entries(porMes).map(([mes, data]) => ({
      mes,
      faturamento: data.faturamento,
      custo: data.custo,
      lucro: data.lucro,
    }))

    // Agrupar por condição
    const porCondicao: Record<string, { faturamento: number; lucro: number; quantidade: number }> = {}
    for (const venda of vendas) {
      const condicao = venda.condicao || 'Não informado'
      if (!porCondicao[condicao]) {
        porCondicao[condicao] = { faturamento: 0, lucro: 0, quantidade: 0 }
      }
      porCondicao[condicao].faturamento += venda.faturamento
      porCondicao[condicao].lucro += venda.lucro
      porCondicao[condicao].quantidade += 1
    }

    const condicaoData = Object.entries(porCondicao).map(([condicao, data]) => ({
      condicao,
      faturamento: data.faturamento,
      lucro: data.lucro,
      quantidade: data.quantidade,
    }))

    return NextResponse.json(
      {
        resumo: {
          totalFaturamento,
          totalCusto,
          totalLucro,
          margemMedia,
          totalVendas: vendas.length,
        },
        porProduto: produtosData,
        porMes: mesesData,
        porCondicao: condicaoData,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error)
    return NextResponse.json(
      {
        error: 'Erro ao buscar dados do dashboard',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
