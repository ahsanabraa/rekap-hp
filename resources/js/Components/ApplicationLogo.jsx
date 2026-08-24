import { FiCheck, FiSmartphone } from 'react-icons/fi';

export default function ApplicationLogo({ className = '' }) {
    return (
        <span className={`relative inline-flex items-center justify-center rounded-xl bg-sky-100 text-sky-600 ${className}`} aria-label="RekapHP">
            <FiSmartphone className="h-5 w-5" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-white"><FiCheck className="h-2.5 w-2.5" /></span>
        </span>
    );
}
