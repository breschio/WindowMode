import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    let dioramas: any[] = []

    // Try to fetch from database
    try {
      dioramas = await prisma.diorama.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          objects: {
            orderBy: { depthLayer: 'asc' }
          }
        }
      })
    } catch (dbError) {
      console.log('Database error, will use file-based dioramas:', dbError)
    }

    // ALSO include file-based dioramas (for generated GLBs not yet in DB)
    const { readdir } = await import('fs/promises')
    const { join } = await import('path')

    const dioramasPath = join(process.cwd(), 'public', 'dioramas')
    const files = await readdir(dioramasPath)
    const glbFiles = files.filter(file => file.endsWith('.glb'))

    // Filter out GLBs that are already in database objects
    const dbGlbPaths = new Set(
      dioramas.flatMap(d => d.objects?.map((o: any) => o.glbUrl) || [])
    )

    const newGlbFiles = glbFiles.filter(file => !dbGlbPaths.has(`/dioramas/${file}`))

    const fileDioramas = newGlbFiles.map((file, index) => {
      const id = file.replace('.glb', '')
      return {
        id,
        title: `Generated Model ${index + 1}`,
        description: 'AI-generated 3D model from text prompt',
        compositeVvUrl: null,
        renderMode: 'layered' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        objects: [
          {
            id: `obj-${id}`,
            dioramaId: id,
            name: `Object ${index + 1}`,
            prompt: 'AI generated',
            depthLayer: 1,
            position: { x: 0, y: 0, z: 0 },
            scale: 1.0,
            rotation: { x: 0, y: 0, z: 0 },
            vvUrl: `/dioramas/${file}`,
            glbUrl: `/dioramas/${file}`,
            imageUrl: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      }
    })

    // Combine database and file-based dioramas
    const allDioramas = [...dioramas, ...fileDioramas]

    return NextResponse.json({ dioramas: allDioramas })
  } catch (error) {
    console.error('Failed to fetch dioramas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dioramas', dioramas: [] },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const diorama = await prisma.diorama.create({
      data: {
        title: body.title,
        description: body.description,
        renderMode: body.renderMode || 'layered',
        compositeVvUrl: body.compositeVvUrl
      }
    })

    return NextResponse.json({ diorama }, { status: 201 })
  } catch (error) {
    console.error('Failed to create diorama:', error)
    return NextResponse.json(
      { error: 'Failed to create diorama' },
      { status: 500 }
    )
  }
}
