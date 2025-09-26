import { hashPassword } from '@/lib/hash';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';


const RegisterSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
    name: z.string().max(100).optional(),
});


export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = RegisterSchema.parse(body);


        // check existing
        const exists = await prisma.user.findUnique({ where: { email: parsed.email } });
        if (exists) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });


        const hashed = await hashPassword(parsed.password);


        const user = await prisma.user.create({
            data: {
                email: parsed.email,
                password: hashed,
                name: parsed.name,
            },
            select: { id: true, email: true, name: true, createdAt: true },
        });


        return NextResponse.json({ user }, { status: 201 });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', issues: err }, { status: 422 });
        }
        console.error(err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}