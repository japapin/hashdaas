import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { db } from '@/lib/db'

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_SPREADSHEET_ID || '1-4Y3UBvVaq-vgtRkU9BvXcmiWmcoRMYdjBX5kdjmWB4'
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY || 'AIzaSyClW8qW40WGipybiOGRWhFOblRUCekQWEI'

export async function POST() {
  try {
    // Verificar se a API key está configurada
    if (!API_KEY || API_KEY === 'AIzaSyC2V1h6GwyJkvvovyZBAODcZTWhkWKjsnE') {
      return NextResponse.json(
        {
          error: 'API Key do Google Sheets não configurada ou expirada',
          details: 'Por favor, configure uma nova API Key válida no arquivo .env',
          suggestion: '1. Vá ao Google Cloud Console\n2. Crie um novo projeto ou use um existente\n3. Ative a Google Sheets API\n4. Crie uma API Key\n5. Atualize o arquivo .env com GOOGLE_SHEETS_API_KEY'
        },
        { status: 400 }
      )
    }

    const sheets = google.sheets({
      version: 'v4',
      auth: API_KEY,
    })

    console.log('=== INICIANDO SINCRONIZAÇÃO ===')
    console.log('Planilha ID:', SPREADSHEET_ID)
    console.log('Range: A:F')

    // Buscar dados da planilha
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'A:F', // Colunas A até F (Produto, Faturamento, Custo, Lucro, Data, Condição)
    })

    const rows = response.data.values
    console.log('Linhas recebidas:', rows ? rows.length : 0)
    
    if (!rows || rows.length === 0) {
      console.log('⚠️ Planilha vazia ou sem dados!')
      return NextResponse.json(
        { 
          error: 'Nenhum dado encontrado na planilha',
          suggestion: 'Verifique se a planilha contém dados nas colunas A até F'
        },
        { status: 404 }
      )
    }

    // Pular cabeçalho e processar cada linha
    const dataRows = rows.slice(1)
    let syncCount = 0
    let errorCount = 0
    let updateCount = 0

    for (const row of dataRows) {
      if (row.length < 5) {
        errorCount++
        continue // Pular linhas incompletas
      }

      const produto = row[0]?.trim() || ''
      const faturamento = parseFloat(row[1]?.replace(',', '.') || '0')
      const custo = parseFloat(row[2]?.replace(',', '.') || '0')
      const lucro = parseFloat(row[3]?.replace(',', '.') || '0')
      const dataStr = row[4]?.trim() || ''
      const condicao = row[5]?.trim() || ''

      if (!produto || !dataStr) {
        errorCount++
        continue
      }

      // Parse da data (assumindo formato DD/MM/YYYY)
      const [day, month, year] = dataStr.split('/')
      const data = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))

      if (isNaN(data.getTime())) {
        console.warn(`Data inválida: ${dataStr}`)
        errorCount++
        continue
      }

      // Usar upsert para evitar duplicatas - atualiza se já existe, cria se não existe
      try {
        console.log(`Processando: ${produto} | R${faturamento} | ${dataStr}`)
        const result = await db.venda.upsert({
          where: {
            produto_data: {
              produto,
              data,
            },
          },
          update: {
            faturamento,
            custo,
            lucro,
            condicao,
          },
          create: {
            produto,
            faturamento,
            custo,
            lucro,
            data,
            condicao,
          },
        })

        const isNew = result.createdAt.getTime() === result.updatedAt.getTime()
        console.log(`Resultado: ${isNew ? 'NOVO REGISTRO CRIADO' : 'REGISTRO ATUALIZADO'}`)
        if (isNew) {
          syncCount++ // Nova inserção
        } else {
          updateCount++ // Atualização de registro existente
        }
      } catch (dbError) {
        console.error('Erro ao sincronizar venda:', dbError)
        errorCount++
      }
    }

    console.log(`=== SINCRONIZAÇÃO CONCLUÍDA ===`)
    console.log(`Processadas: ${dataRows.length} linhas`)
    console.log(`Novos registros: ${syncCount}`)
    console.log(`Registros atualizados: ${updateCount}`)
    console.log(`Erros: ${errorCount}`)

    return NextResponse.json(
      {
        success: true,
        message: `Sincronização concluída com sucesso! ${syncCount} novos registros importados${updateCount > 0 ? `, ${updateCount} registros atualizados` : ''}.${errorCount > 0 ? ` ${errorCount} registros com erro foram pulados.` : ''}`,
        syncCount,
        updateCount,
        errorCount,
        totalRows: dataRows.length,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Erro ao sincronizar dados:', error)
    
    // Verificar erros específicos do Google Sheets
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    if (errorMessage.includes('API key expired')) {
      return NextResponse.json(
        {
          error: 'API Key do Google Sheets expirada',
          details: errorMessage,
          suggestion: 'Por favor, gere uma nova API Key no Google Cloud Console e atualize o arquivo .env'
        },
        { status: 400 }
      )
    }
    
    if (errorMessage.includes('API key not valid')) {
      return NextResponse.json(
        {
          error: 'API Key do Google Sheets inválida',
          details: errorMessage,
          suggestion: 'Verifique se a API Key está correta no arquivo .env'
        },
        { status: 400 }
      )
    }

    if (errorMessage.includes('The caller does not have permission')) {
      return NextResponse.json(
        {
          error: 'Sem permissão para acessar a planilha',
          details: errorMessage,
          suggestion: 'Verifique se a planilha está compartilhada corretamente'
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      {
        error: 'Erro ao sincronizar dados do Google Sheets',
        details: errorMessage,
        suggestion: 'Verifique as configurações no arquivo .env'
      },
      { status: 500 }
    )
  }
}
