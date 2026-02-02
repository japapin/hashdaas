import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const confirmacao = searchParams.get('confirmacao')

    // Exigir confirmação para evitar limpezas acidentais
    if (confirmacao !== 'limpar-dados-deletados') {
      return NextResponse.json(
        {
          error: 'Confirmação necessária',
          message: 'Adicione ?confirmacao=limpar-dados-deletados à URL para confirmar a limpeza de dados já deletados'
        },
        { status: 400 }
      )
    }

    // Limpar TODOS os registros do banco
    const result = await db.venda.deleteMany({})

    return NextResponse.json({
      success: true,
      message: `Foram limpos ${result.count} registros do banco de dados`,
      count: result.count,
    })
  } catch (error) {
    console.error('Erro ao limpar dados:', error)
    return NextResponse.json(
      {
        error: 'Erro ao limpar dados do banco',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
