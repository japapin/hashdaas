import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Criar dados de demonstração para Urban Country Store
    const demoData = [
      // Calças jeans
      { produto: 'Calça Jeans Masculina', faturamento: 189.90, custo: 95.00, lucro: 94.90, data: '2024-01-15', condicao: 'À vista' },
      { produto: 'Calça Jeans Feminina', faturamento: 179.90, custo: 88.00, lucro: 91.90, data: '2024-01-16', condicao: 'À vista' },
      { produto: 'Calça Jeans Masculina', faturamento: 189.90, custo: 95.00, lucro: 94.90, data: '2024-01-18', condicao: '2x' },
      { produto: 'Calça Skinny Feminina', faturamento: 199.90, custo: 92.00, lucro: 107.90, data: '2024-02-05', condicao: 'À vista' },
      { produto: 'Calça Jeans Masculina', faturamento: 189.90, custo: 95.00, lucro: 94.90, data: '2024-02-12', condicao: '3x' },
      
      // Camisas
      { produto: 'Camisa Xadrez Country', faturamento: 129.90, custo: 55.00, lucro: 74.90, data: '2024-01-20', condicao: 'À vista' },
      { produto: 'Camisa Xadrez Country', faturamento: 129.90, custo: 55.00, lucro: 74.90, data: '2024-01-25', condicao: '2x' },
      { produto: 'Camisa Flanela', faturamento: 149.90, custo: 65.00, lucro: 84.90, data: '2024-02-08', condicao: 'À vista' },
      { produto: 'Camisa Country', faturamento: 139.90, custo: 58.00, lucro: 81.90, data: '2024-02-15', condicao: '2x' },
      { produto: 'Camisa Xadrez Country', faturamento: 129.90, custo: 55.00, lucro: 74.90, data: '2024-03-01', condicao: 'À vista' },
      
      // Botas
      { produto: 'Bota Country Masculina', faturamento: 349.90, custo: 180.00, lucro: 169.90, data: '2024-01-22', condicao: 'À vista' },
      { produto: 'Bota Country Feminina', faturamento: 329.90, custo: 165.00, lucro: 164.90, data: '2024-01-28', condicao: '3x' },
      { produto: 'Bota Country Masculina', faturamento: 349.90, custo: 180.00, lucro: 169.90, data: '2024-02-20', condicao: '2x' },
      { produto: 'Bota Country Feminina', faturamento: 329.90, custo: 165.00, lucro: 164.90, data: '2024-03-10', condicao: 'À vista' },
      { produto: 'Bota Country Masculina', faturamento: 349.90, custo: 180.00, lucro: 169.90, data: '2024-03-18', condicao: 'À vista' },
      
      // Acessórios
      { produto: 'Chapéu Country', faturamento: 89.90, custo: 35.00, lucro: 54.90, data: '2024-01-30', condicao: 'À vista' },
      { produto: 'Cinto Country', faturamento: 79.90, custo: 28.00, lucro: 51.90, data: '2024-02-05', condicao: 'À vista' },
      { produto: 'Chapéu Country', faturamento: 89.90, custo: 35.00, lucro: 54.90, data: '2024-02-25', condicao: '2x' },
      { produto: 'Cinto Country', faturamento: 79.90, custo: 28.00, lucro: 51.90, data: '2024-03-05', condicao: 'À vista' },
      { produto: 'Chapéu Country', faturamento: 89.90, custo: 35.00, lucro: 54.90, data: '2024-03-15', condicao: 'À vista' },
      
      // Jaquetas
      { produto: 'Jaqueta Jeans', faturamento: 249.90, custo: 120.00, lucro: 129.90, data: '2024-01-10', condicao: '2x' },
      { produto: 'Jaqueta Country', faturamento: 299.90, custo: 145.00, lucro: 154.90, data: '2024-02-02', condicao: '3x' },
      { produto: 'Jaqueta Jeans', faturamento: 249.90, custo: 120.00, lucro: 129.90, data: '2024-02-28', condicao: '2x' },
      { produto: 'Jaqueta Country', faturamento: 299.90, custo: 145.00, lucro: 154.90, data: '2024-03-20', condicao: 'À vista' },
      { produto: 'Jaqueta Jeans', faturamento: 249.90, custo: 120.00, lucro: 129.90, data: '2024-03-25', condicao: 'À vista' },
      
      // Mais vendas de março
      { produto: 'Calça Jeans Masculina', faturamento: 189.90, custo: 95.00, lucro: 94.90, data: '2024-03-02', condicao: 'À vista' },
      { produto: 'Camisa Xadrez Country', faturamento: 129.90, custo: 55.00, lucro: 74.90, data: '2024-03-05', condicao: '2x' },
      { produto: 'Bota Country Feminina', faturamento: 329.90, custo: 165.00, lucro: 164.90, data: '2024-03-08', condicao: '3x' },
      { produto: 'Cinto Country', faturamento: 79.90, custo: 28.00, lucro: 51.90, data: '2024-03-12', condicao: 'À vista' },
      { produto: 'Chapéu Country', faturamento: 89.90, custo: 35.00, lucro: 54.90, data: '2024-03-15', condicao: 'À vista' },
    ]

    let createdCount = 0
    for (const item of demoData) {
      await db.venda.create({
        data: {
          produto: item.produto,
          faturamento: item.faturamento,
          custo: item.custo,
          lucro: item.lucro,
          data: new Date(item.data),
          condicao: item.condicao,
        },
      })
      createdCount++
    }

    return NextResponse.json({
      success: true,
      message: `${createdCount} registros de demonstração criados com sucesso!`,
      createdCount,
    })
  } catch (error) {
    console.error('Erro ao criar dados de demonstração:', error)
    return NextResponse.json(
      {
        error: 'Erro ao criar dados de demonstração',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
