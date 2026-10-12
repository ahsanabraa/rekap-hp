'use client';

import { useState, useEffect } from 'react';
import { Link, usePage, Head } from '@inertiajs/react';
import { Sheet, SheetContent } from '@/Components/ui/sheet';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/Components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    BookOpen,
    User,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Smartphone,
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['siswa', 'wali_kelas', 'kesiswaan'] },
    { name: 'Kelas', href: '/classes', icon: BookOpen, roles: ['kesiswaan'] },
    { name: 'Siswa', href: '/students', icon: Users, roles: ['kesiswaan'] },
];

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const flash = usePage().props.flash ?? {};
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 8);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const userNavItems = navigation.filter((item) => item.roles.includes(user.role));
    const isKesiswaan = user.role === 'kesiswaan';
    const isWaliKelas = user.role === 'wali_kelas';
    const isSiswa = user.role === 'siswa';

    return (
        <div className="min-h-screen bg-bg-secondary">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="left" className="w-72 p-0 max-h-screen">
                    <div className="flex h-full flex-col">
                        <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
                            <Link href="/dashboard" className="flex items-center gap-2" aria-label="RekapHP Home">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                    <Smartphone className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-semibold text-lg text-text">RekapHP</span>
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} aria-label="Tutup menu">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1" aria-label="Navigasi utama">
                            {userNavItems.map((item) => {
                                const isActive = window.location.pathname === item.href || window.location.pathname.startsWith(item.href + '/');
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                            isActive
                                                ? 'bg-primary text-white'
                                                : 'text-text-secondary hover:bg-bg-tertiary hover:text-text'
                                        )}
                                        aria-current={isActive ? 'page' : undefined}
                                    >
                                        <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                        <div className="border-t p-3">
                            <div className="flex items-center gap-3 px-3 py-2">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className="text-sm font-medium">
                                        {user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-text">{user.name}</p>
                                    <p className="text-xs text-text-muted truncate">@{user.username}</p>
                                </div>
                            </div>
                            <Separator className="my-3" />
                            <Link
                                href={route('profile.edit')}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <User className="h-5 w-5" aria-hidden="true" />
                                Profil
                            </Link>
                            <form action={route('logout')} method="POST" onSubmit={() => setMobileMenuOpen(false)}>
                                <Button
                                    type="submit"
                                    variant="ghost"
                                    className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text"
                                >
                                    <LogOut className="h-5 w-5" aria-hidden="true" />
                                    Keluar
                                </Button>
                            </form>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-[260px] lg:flex-col lg:border-r lg:bg-white" aria-label="Sidebar">
                <div className="flex h-16 shrink-0 items-center border-b px-4">
                    <Link href="/dashboard" className="flex items-center gap-2" aria-label="RekapHP Home">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Smartphone className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-lg text-text">RekapHP</span>
                    </Link>
                </div>
                <div className="flex flex-1 flex-col overflow-y-auto">
                    <nav className="flex-1 px-3 py-3 space-y-1" aria-label="Navigasi utama">
                        {userNavItems.map((item) => {
                            const isActive = window.location.pathname === item.href || window.location.pathname.startsWith(item.href + '/');
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-primary text-white'
                                            : 'text-text-secondary hover:bg-bg-tertiary hover:text-text'
                                    )}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="border-t p-3">
                        <div className="flex items-center gap-3 px-3 py-2">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback className="text-sm font-medium">
                                    {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-text">{user.name}</p>
                                <p className="text-xs text-text-muted truncate">@{user.username}</p>
                            </div>
                        </div>
                        <Separator className="my-3" />
                        <Link
                            href={route('profile.edit')}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text"
                        >
                            <User className="h-5 w-5" aria-hidden="true" />
                            Profil
                        </Link>
                        <form action={route('logout')} method="POST">
                            <Button
                                type="submit"
                                variant="ghost"
                                className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text"
                            >
                                <LogOut className="h-5 w-5" aria-hidden="true" />
                                Keluar
                            </Button>
                        </form>
                    </div>
                </div>
            </aside>

            <div className="lg:pl-[260px]">
                <header className={cn(
                    'sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 px-4 lg:px-6',
                    isScrolled && 'shadow-sm'
                )}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Buka menu"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="flex-1" />
                    <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted">
                        {isKesiswaan && 'Kesiswaan'}
                        {isWaliKelas && 'Wali Kelas'}
                        {isSiswa && 'Siswa'}
                    </div>
                    
                    {/* Profile Menu - Desktop */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-sm font-medium">
                                        {user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden md:inline-block truncate max-w-[140px]">{user.name}</span>
                                <ChevronDown className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="px-3 py-2 border-b">
                                <p className="text-sm font-medium text-text">{user.name}</p>
                                <p className="text-xs text-text-muted truncate">@{user.username}</p>
                            </div>
                            <DropdownMenuItem asChild>
                                <Link href={route('profile.edit')} className="flex items-center gap-2">
                                    <User className="h-4 w-4" aria-hidden="true" />
                                    Profil
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <form action={route('logout')} method="POST">
                                    <button type="submit" className="flex w-full items-center gap-2 text-left text-sm">
                                        <LogOut className="h-4 w-4" aria-hidden="true" />
                                        Keluar
                                    </button>
                                </form>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                {header && (
                    <div className="border-b px-4 py-5 lg:px-6">
                        {header}
                    </div>
                )}

                {flash.success && (
                    <div className="mx-auto mt-4 max-w-7xl px-4 lg:px-6">
                        <div className="rounded-lg border border-success-light bg-success-light px-4 py-3 text-sm font-medium text-success">
                            {flash.success}
                        </div>
                    </div>
                )}

                <main className="container-app py-5 lg:py-6">{children}</main>
            </div>
        </div>
    );
}