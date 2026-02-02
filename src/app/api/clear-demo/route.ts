import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Deletar todos os dados do banco de dados
    const result = await db.venda.deleteMany({})

    return NextResponse.json({
      success: true,
      message: `${result.count} registros removidos do banco de dados.`,
      removedCount: result.count,
    })
  } catch (error) {
    console.error('Erro ao limpar dados:', error)
    return NextResponse.json(
      {
        error: 'Erro ao limpar dados do banco de dados',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
