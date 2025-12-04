import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found')
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' })

    const imageData = image.includes(',') ? image.split(',')[1] : image

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg'
        }
      },
      'Extract transaction information from this receipt/image. Return ONLY a JSON object with: amount (number), date (YYYY-MM-DD format), note (merchant/description), category (suggest category in Thai based on merchant name: อาหาร, เดินทาง, ที่พัก/ค่าเช่า, ค่าไฟ/ค่าน้ำ, ช้อปปิ้ง, สุขภาพ, ความบันเทิง, เงินเดือน, โบนัส, การลงทุน). If cannot extract, return null for that field.'
    ])

    const text = result.response.text()
    if (!text) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 })
    }

    const data = JSON.parse(jsonMatch[0])
    return NextResponse.json(data)
  } catch (error) {
    console.error('OCR error:', error)
    return NextResponse.json({ error: 'OCR failed', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
