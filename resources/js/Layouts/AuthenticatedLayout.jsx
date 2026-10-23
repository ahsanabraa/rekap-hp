'use client';

import { useState, useEffect } from 'react';
import { Link, usePage, Head, router } from '@inertiajs/react';
import { Sheet, SheetContent } from '@/Components/ui/sheet';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/Components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import AppLogo from '@/Components/AppLogo';
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
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['siswa', 'wali_kelas', 'kesiswaan'] },
    { name: 'Kelas', href: '/classes', icon: BookOpen, roles: ['kesiswaan'] },
    { name: 'Siswa', href: '/students', icon: Users, roles: ['kesiswaan'] },
];

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const isClassLeader = usePage().props.isClassLeader ?? false;
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
                                <AppLogo size="sm" />
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
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text"
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    router.post(route('logout'));
                                }}
                            >
                                <LogOut className="h-5 w-5" aria-hidden="true" />
                                Keluar
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-[260px] lg:flex-col lg:border-r lg:bg-white" aria-label="Sidebar">
                <div className="flex h-16 shrink-0 items-center border-b px-4">
                    <Link href="/dashboard" className="flex items-center gap-2" aria-label="RekapHP Home">
                        <AppLogo size="sm" />
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
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text"
                            onClick={() => router.post(route('logout'))}
                        >
                            <LogOut className="h-5 w-5" aria-hidden="true" />
                            Keluar
                        </Button>
                    </div>
                </div>
            </aside>

            <div className="min-w-0 lg:pl-[260px]">
                <header className={cn(
                    'sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-white/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:gap-4 sm:px-4 lg:px-6',
                    isScrolled && 'shadow-sm'
                )}>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 lg:hidden"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Buka menu"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="min-w-0 flex-1" />
                    <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted">
                        {isKesiswaan && 'Kesiswaan'}
                        {isWaliKelas && 'Wali Kelas'}
                        {isSiswa && (isClassLeader ? 'Ketua Kelas' : 'Siswa')}
                    </div>
                    
                    {/* Profile Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" className="flex max-w-full items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text sm:gap-2 sm:px-3">
                                <Avatar className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
                                    <AvatarFallback className="text-xs font-medium sm:text-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden max-w-[120px] truncate md:inline-block lg:max-w-[140px]">{user.name}</span>
                                <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={8} className="w-60">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col gap-1">
                                    <p className="truncate text-sm font-medium text-text">{user.name}</p>
                                    <p className="truncate text-xs text-text-muted">@{user.username}</p>
                                    <div className="mt-1">
                                        <Badge variant={isKesiswaan ? 'primary' : isWaliKelas ? 'success' : 'warning'}>
                                            {isKesiswaan
                                                ? 'Kesiswaan'
                                                : isWaliKelas
                                                  ? 'Wali Kelas'
                                                  : isClassLeader
                                                    ? 'Ketua Kelas'
                                                    : 'Siswa'}
                                        </Badge>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard" className="flex cursor-pointer items-center gap-2">
                                    <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                                    Dashboard
                                </Link>
                            </DropdownMenuItem>
                            {isKesiswaan && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link href="/classes" className="flex cursor-pointer items-center gap-2">
                                            <BookOpen className="h-4 w-4" aria-hidden="true" />
                                            Kelas
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/students" className="flex cursor-pointer items-center gap-2">
                                            <Users className="h-4 w-4" aria-hidden="true" />
                                            Siswa
                                        </Link>
                                    </DropdownMenuItem>
                                </>
                            )}
                            <DropdownMenuItem asChild>
                                <Link href={route('profile.edit')} className="flex cursor-pointer items-center gap-2">
                                    <User className="h-4 w-4" aria-hidden="true" />
                                    Profil
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    router.post(route('logout'));
                                }}
                                className="flex cursor-pointer items-center gap-2 text-danger focus:text-danger"
                            >
                                <LogOut className="h-4 w-4" aria-hidden="true" />
                                Keluar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                {header && (
                    <div className="border-b px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
                        {header}
                    </div>
                )}

                {flash.success && (
                    <div className="mx-auto mt-3 max-w-7xl px-3 sm:mt-4 sm:px-4 lg:px-6">
                        <div className="break-words rounded-lg border border-success-light bg-success-light px-3 py-2.5 text-sm font-medium text-success sm:px-4 sm:py-3">
                            {flash.success}
                        </div>
                    </div>
                )}

                <main className="container-app min-w-0 overflow-x-clip py-4 sm:py-5 lg:py-6">{children}</main>
            </div>
        </div>
    );
}