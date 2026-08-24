import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { FiBookOpen, FiChevronDown, FiGrid, FiLogOut, FiMenu, FiUser, FiUsers, FiX } from 'react-icons/fi';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const isKesiswaan = user.role === 'kesiswaan';

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center gap-2">
                                    <ApplicationLogo className="block h-8 w-auto fill-current text-sky-500" />
                                    <span className="hidden text-sm font-bold tracking-tight text-slate-800 sm:block">RekapHP</span>
                                </Link>
                            </div>
                            <div className="hidden space-x-7 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    <span className="inline-flex items-center gap-2"><FiGrid />Dashboard</span>
                                </NavLink>
                                {isKesiswaan && <>
                                    <NavLink href={route('classes.index')} active={route().current('classes.*')}><span className="inline-flex items-center gap-2"><FiBookOpen />Kelas</span></NavLink>
                                    <NavLink href={route('students.index')} active={route().current('students.*')}><span className="inline-flex items-center gap-2"><FiUsers />Siswa</span></NavLink>
                                </>}
                            </div>
                        </div>
                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button type="button" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-sky-50 hover:text-sky-600 focus:outline-none">
                                        <FiUser className="text-sky-500" />{user.name}<FiChevronDown />
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}><span className="inline-flex items-center gap-2"><FiUser />Profile</span></Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button"><span className="inline-flex items-center gap-2"><FiLogOut />Log Out</span></Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                        <div className="-me-2 flex items-center sm:hidden">
                            <button type="button" onClick={() => setShowingNavigationDropdown((value) => !value)} className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 transition hover:bg-sky-50 hover:text-sky-600 focus:outline-none">
                                {showingNavigationDropdown ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`${showingNavigationDropdown ? 'block' : 'hidden'} border-t border-slate-100 sm:hidden`}>
                    <div className="space-y-1 px-4 pb-3 pt-2">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}><span className="inline-flex items-center gap-2"><FiGrid />Dashboard</span></ResponsiveNavLink>
                        {isKesiswaan && <>
                            <ResponsiveNavLink href={route('classes.index')} active={route().current('classes.*')}><span className="inline-flex items-center gap-2"><FiBookOpen />Kelas</span></ResponsiveNavLink>
                            <ResponsiveNavLink href={route('students.index')} active={route().current('students.*')}><span className="inline-flex items-center gap-2"><FiUsers />Siswa</span></ResponsiveNavLink>
                        </>}
                    </div>
                    <div className="border-t border-slate-200 px-4 pb-3 pt-4">
                        <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}><span className="inline-flex items-center gap-2"><FiUser />Profile</span></ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button"><span className="inline-flex items-center gap-2"><FiLogOut />Log Out</span></ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>
            {header && <header className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{header}</div></header>}
            <main>{children}</main>
        </div>
    );
}
