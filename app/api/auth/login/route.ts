import { comparePassword } from '@/lib/hash';
import { signToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';


const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = LoginSchema.parse(body);


        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });


        const ok = await comparePassword(password, user.password);
        if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });


        const token = signToken({ userId: user.id, email: user.email });


        // Set HttpOnly cookie (optional + recommended) and return token as well
        const res = NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name } });
        // cookie options: secure in prod, httpOnly
        res.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60, // 1 hour
        });


        return res;
    } catch (err) {
        if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input', issues: err }, { status: 422 });
        console.error(err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}