import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const checks = await prisma.verificationCheck.findMany({
      orderBy: {
        requestedAt: 'desc',
      },
      include: {
        staffMember: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(checks);
  } catch (error) {
    console.error('Error fetching checks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, documentType, notes, requestedBy } = body;

    // Validate required fields
    if (!customerName || !documentType || !requestedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new verification check
    const check = await prisma.verificationCheck.create({
      data: {
        customerName,
        documentType,
        notes: notes || null,
        requestedBy,
        status: "PENDING",
      },
    });

    return NextResponse.json(check, { status: 201 });
  } catch (error) {
    console.error('Error creating check:', error);
    return NextResponse.json(
      { error: 'Failed to create check' },
      { status: 500 }
    );
  }
}
