import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { parent: true }
    });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const { name, slug, description, parentId, featured, image } = body;
    
    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        parentId: parentId || null,
        featured: featured || false,
        image,
      },
    });
    
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // Delete the category (SQLite Cascade will handle children if configured, 
    // but Prisma relation onDelete: Cascade handles it)
    await prisma.category.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
