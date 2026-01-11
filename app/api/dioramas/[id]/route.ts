import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const diorama = await prisma.diorama.findUnique({
      where: { id },
      include: {
        objects: {
          orderBy: { depthLayer: 'asc' }
        }
      }
    })

    if (!diorama) {
      return NextResponse.json(
        { error: 'Diorama not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ diorama })
  } catch (error) {
    console.error('Failed to fetch diorama:', error)
    return NextResponse.json(
      { error: 'Failed to fetch diorama' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const diorama = await prisma.diorama.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        compositeVvUrl: body.compositeVvUrl,
        renderMode: body.renderMode,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ diorama })
  } catch (error) {
    console.error('Failed to update diorama:', error)
    return NextResponse.json(
      { error: 'Failed to update diorama' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.diorama.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete diorama:', error)
    return NextResponse.json(
      { error: 'Failed to delete diorama' },
      { status: 500 }
    )
  }
}
