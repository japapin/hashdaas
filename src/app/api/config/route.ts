import { NextResponse } from 'next/server'

let GOOGLE_SHEETS_CONFIG = {
  spreadsheetId: '1QnB1NlbqJLu32wKIRJyf-0qKVXVxQTspE6Yt_EY7ARA',
  apiKey: 'AIzaSyC2V1h6GwyJkvvovyZBAODcZTWhkWKjsnE',
}

export async function GET() {
  return NextResponse.json(GOOGLE_SHEETS_CONFIG)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { spreadsheetId, apiKey } = body

    if (spreadsheetId && apiKey) {
      GOOGLE_SHEETS_CONFIG = {
        spreadsheetId,
        apiKey,
      }
      
      return NextResponse.json({
        success: true,
        message: 'Configurações atualizadas. Reinicie o servidor para aplicar as mudanças.',
        config: GOOGLE_SHEETS_CONFIG,
      })
    }

    return NextResponse.json(
      { error: 'spreadsheetId e apiKey são obrigatórios' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    )
  }
}
