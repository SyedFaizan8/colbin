import { verifyToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';


export async function GET(req: Request) {
    try {
        // First try cookie
        const cookieHeader = req.headers.get('cookie') || '';
        const match = cookieHeader.match(/token=([^;]+)/);
        let token = match ? match[1] : null;


        // fallback to Authorization header
        if (!token) {
            const auth = req.headers.get('authorization') || '';
            if (auth.startsWith('Bearer ')) token = auth.slice(7);
        }


        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


        const payload = verifyToken(token as string) as any;
        const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, email: true, name: true, bio: true } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });


        return NextResponse.json({ user });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}