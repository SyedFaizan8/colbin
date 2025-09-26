import { NextResponse } from 'next/server';

export async function POST() {
    // Return a response and clear the token cookie by setting it to empty with maxAge 0
    const res = NextResponse.json({ ok: true, message: 'Logged out' }, { status: 200 });

    res.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0 // expire immediately
    });

    return res;
}
