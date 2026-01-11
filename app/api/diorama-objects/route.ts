import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const dioramaObject = await prisma.dioramaObject.create({
      data: {
        dioramaId: body.dioramaId,
        name: body.name,
        prompt: body.prompt,
        depthLayer: body.depthLayer,
        position: body.position,
        scale: body.scale || 1.0,
        rotation: body.rotation,
        vvUrl: body.vvUrl,
        glbUrl: body.glbUrl,
        imageUrl: body.imageUrl
      }
    })

    return NextResponse.json({ dioramaObject }, { status: 201 })
  } catch (error) {
    console.error('Failed to create diorama object:', error)
    return NextResponse.json(
      { error: 'Failed to create diorama object' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Object ID is required' },
        { status: 400 }
      )
    }

    await prisma.dioramaObject.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete diorama object:', error)
    return NextResponse.json(
      { error: 'Failed to delete diorama object' },
      { status: 500 }
    )
  }
}
