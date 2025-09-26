// app/components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="w-full py-4">
            <div className="container flex items-center justify-between">
                <Link href="/">
                    <a className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl center" style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path d="M12 2L2 7v6c0 5 4 9 10 9s10-4 10-9V7l-10-5z" fill="white" opacity="0.95" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-lg font-semibold">HireFlow</div>
                            <div className="text-xs text-slate-400 -mt-0.5">Recruitment prototype</div>
                        </div>
                    </a>
                </Link>

                <div className="flex items-center gap-3">
                    <Link href="/(auth)/register"><a className="px-3 py-2 rounded-md text-sm hover:bg-white/3">Register</a></Link>
                    <Link href="/(auth)/login"><a className="btn-accent text-sm">Login</a></Link>
                </div>
            </div>
        </nav>
    );
}
