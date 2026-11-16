import { Calendar } from 'lucide-react';

import { formatDate } from './constants';

function PageHeader({ title, subtitle, date }) {
    return (
        <div className="mb-4 sm:mb-5">
            {(date || subtitle) && (
                <span className="inline-flex max-w-full items-center gap-1.5 truncate text-xs text-text-muted">
                    <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{date ? formatDate(date) : subtitle}</span>
                </span>
            )}
            <h1 className="mt-1.5 break-words text-xl font-semibold tracking-tight text-text sm:mt-2 sm:text-2xl">
                {title}
            </h1>
        </div>
    );
}

export default PageHeader;
