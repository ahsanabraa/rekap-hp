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
import { useFeedback } from '@/Components/FeedbackProvider';
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
    ClipboardCheck,
    ClipboardList,
    PackageCheck,
    Smartphone,
    GraduationCap,
} from 'lucide-react';

const navigationByRole = {
    kesiswaan: [
        { name: 'Ringkasan', href: '/dashboard#ringkasan', section: 'ringkasan', icon: LayoutDashboard },
        { name: 'Monitoring kelas', href: '/dashboard#monitoring', section: 'monitoring', icon: ClipboardList },
        { name: 'Status per siswa', href: '/dashboard#status-per-siswa', section: 'status-per-siswa', icon: Users },
        { name: 'Kelas', href: '/classes', icon: BookOpen },
        { name: 'Siswa', href: '/students', icon: GraduationCap },
    ],
    wali_kelas: [
        { name: 'Absensi', href: '/dashboard#absensi', section: 'absensi', icon: ClipboardCheck },
        { name: 'Ringkasan setoran', href: '/dashboard#ringkasan-setoran', section: 'ringkasan-setoran', icon: PackageCheck },
        { name: 'Status per siswa', href: '/dashboard#status-per-siswa', section: 'status-per-siswa', icon: Users },
    ],
    ketua_kelas: [
        { name: 'Ringkasan setoran', href: '/dashboard#ringkasan', section: 'ringkasan', icon: PackageCheck },
        { name: 'Checklist setoran', href: '/dashboard#checklist-setoran', section: 'checklist-setoran', icon: ClipboardCheck },
    ],
    sekretaris: [
        { name: 'Ringkasan absensi', href: '/dashboard#ringkasan', section: 'ringkasan', icon: ClipboardList },
        { name: 'Isi absensi', href: '/dashboard#absensi', section: 'absensi', icon: ClipboardCheck },
    ],
    siswa: [
        { name: 'Status HP saya', href: '/dashboard#status-hp', section: 'status-hp', icon: Smartphone },
        { name: 'Setoran kelas', href: '/dashboard#setoran-kelas', section: 'setoran-kelas', icon: PackageCheck },
    ],
};

function NavList({ items, isActive, onNavigate, onClose, className }) {
    return (
        <nav className={className} aria-label="Navigasi utama">
            {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);

                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={(event) => onNavigate(event, item, onClose)}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            active
                                ? 'bg-primary text-white'
                                : 'text-text-secondary hover:bg-bg-tertiary hover:text-text',
                        )}
                        aria-current={active ? 'page' : undefined}
                    >
                        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const page = usePage();
    const user = page.props.auth.user;
    const isClassLeader = page.props.isClassLeader ?? false;
    const isClassSecretary = page.props.isClassSecretary ?? false;
    const classRole =
        page.props.classRole ??
        (isClassLeader ? 'ketua_kelas' : isClassSecretary ? 'sekretaris' : null);
    const flashSuccess = page.props.flash?.success;
    const flashError = page.props.flash?.error;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeHash, setActiveHash] = useState('');
    const { success: notifySuccess, error: notifyError } = useFeedback();

    useEffect(() => {
        if (flashSuccess) {
            notifySuccess(flashSuccess);
        }
    }, [flashSuccess, notifySuccess]);

    useEffect(() => {
        if (flashError) {
            notifyError(flashError);
        }
    }, [flashError, notifyError]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 8);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const syncHash = () => setActiveHash(window.location.hash);
        syncHash();
        window.addEventListener('hashchange', syncHash);
        return () => window.removeEventListener('hashchange', syncHash);
    }, [page.url]);

    const navRole =
        user.role === 'siswa'
            ? classRole === 'ketua_kelas'
                ? 'ketua_kelas'
                : classRole === 'sekretaris'
                  ? 'sekretaris'
                  : 'siswa'
            : user.role;
    const userNavItems = navigationByRole[navRole] ?? navigationByRole.siswa;
    const firstSection = userNavItems.find((item) => item.section)?.section;
    const currentPath = page.url.split('#')[0].split('?')[0];

    const isNavItemActive = (item) => {
        if (item.section) {
            if (currentPath !== '/dashboard') return false;
            const hash = activeHash && activeHash !== '#' ? activeHash : `#${firstSection}`;
            return hash === `#${item.section}`;
        }

        return currentPath === item.href || currentPath.startsWith(`${item.href}/`);
    };

    const handleNavigate = (event, item, onClose) => {
        if (!item.section) {
            onClose?.();
            return;
        }

        event.preventDefault();
        onClose?.();

        const hash = `#${item.section}`;

        if (window.location.pathname === '/dashboard') {
            const target = document.getElementById(item.section);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                window.history.replaceState(window.history.state, '', `/dashboard${hash}`);
                setActiveHash(hash);
                return;
            }
        }

        router.visit(`/dashboard${hash}`);
    };

    const isKesiswaan = user.role === 'kesiswaan';
    const isWaliKelas = user.role === 'wali_kelas';
    const isSiswa = user.role === 'siswa';

    return (
        <div className="min-h-screen bg-bg-secondary">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="left" className="w-72 p-0 max-h-screen" showCloseButton={false}>
                    <div className="flex h-full flex-col">
                        <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
                            <Link href="/dashboard" className="flex items-center gap-2" aria-label="RekapHP Home">
                                <AppLogo size="sm" />
                            </Link>
                            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} aria-label="Tutup menu">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <NavList
                            items={userNavItems}
                            isActive={isNavItemActive}
                            onNavigate={handleNavigate}
                            onClose={() => setMobileMenuOpen(false)}
                            className="flex-1 overflow-y-auto px-3 py-3 space-y-1"
                        />
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
                    <NavList
                        items={userNavItems}
                        isActive={isNavItemActive}
                        onNavigate={handleNavigate}
                        className="flex-1 px-3 py-3 space-y-1"
                    />
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
                    'sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-white/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:gap-4 sm:px-4 lg:px-6',
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
                        {isSiswa && (classRole === 'ketua_kelas' ? 'Ketua Kelas' : classRole === 'sekretaris' ? 'Sekretaris' : 'Siswa')}
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
                                        <Badge variant={isKesiswaan ? 'primary' : isWaliKelas ? 'success' : classRole === 'ketua_kelas' ? 'warning' : classRole === 'sekretaris' ? 'primary' : 'neutral'}>
                                            {isKesiswaan
                                                ? 'Kesiswaan'
                                                : isWaliKelas
                                                  ? 'Wali Kelas'
                                                  : classRole === 'ketua_kelas'
                                                    ? 'Ketua Kelas'
                                                    : classRole === 'sekretaris'
                                                      ? 'Sekretaris'
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

                <main className="container-app min-w-0 overflow-x-clip py-4 sm:py-5 lg:py-6">{children}</main>
            </div>
        </div>
    );
}