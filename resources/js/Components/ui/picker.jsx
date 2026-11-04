import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Dropdown sederhana yang sepenuhnya dikontrol sendiri.
// Trigger selalu toggle buka/tutup, jadi perilakunya sama di mouse maupun layar sentuh.
export function Picker({
    value,
    onValueChange,
    options = [],
    placeholder = 'Pilih',
    disabled = false,
    searchable = false,
    className,
    id,
    invalid = false,
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const listRef = useRef(null);
    const searchRef = useRef(null);
    const listboxId = useId();

    const items = useMemo(
        () =>
            options.map((option) =>
                typeof option === 'string' ? { value: option, label: option } : option,
            ),
        [options],
    );

    const selected = items.find((option) => option.value === (value ?? ''));
    const filtered = query
        ? items.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))
        : items;

    const showSearch = searchable && items.length > 5;

    function close() {
        setOpen(false);
        setQuery('');
        triggerRef.current?.focus();
    }

    function choose(option) {
        if (!option) return;
        onValueChange?.(option.value);
        close();
    }

    useEffect(() => {
        if (!open) return;

        function handlePointerDown(event) {
            if (!containerRef.current?.contains(event.target)) {
                setOpen(false);
                setQuery('');
            }
        }

        document.addEventListener('pointerdown', handlePointerDown, true);
        return () => document.removeEventListener('pointerdown', handlePointerDown, true);
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const selectedIndex = filtered.findIndex((option) => option.value === (value ?? ''));
        setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);

        if (showSearch) {
            window.requestAnimationFrame(() => searchRef.current?.focus());
        }
        // Hanya dijalankan saat dropdown dibuka.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const node = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
        node?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex, open]);

    function handleKeyDown(event) {
        if (event.key === 'Escape' && open) {
            event.stopPropagation();
            event.preventDefault();
            close();
            return;
        }

        if (!open) {
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
                event.preventDefault();
                setOpen(true);
            }
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((current) => Math.min(current + 1, filtered.length - 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((current) => Math.max(current - 1, 0));
        } else if (event.key === 'Enter') {
            event.preventDefault();
            choose(filtered[activeIndex]);
        } else if (event.key === 'Tab') {
            setOpen(false);
            setQuery('');
        }
    }

    return (
        <div ref={containerRef} className={cn('relative', className)} onKeyDown={handleKeyDown}>
            <button
                ref={triggerRef}
                id={id}
                type="button"
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listboxId : undefined}
                aria-invalid={invalid || undefined}
                disabled={disabled}
                onClick={() => {
                    setOpen((currentlyOpen) => !currentlyOpen);
                    setQuery('');
                }}
                className={cn(
                    'flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-white px-3 py-2 text-left text-sm ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    invalid ? 'border-danger' : 'border-border',
                )}
            >
                <span
                    className={cn(
                        'line-clamp-1 min-w-0 flex-1',
                        selected ? 'text-text' : 'text-text-muted',
                    )}
                >
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown
                    className={cn(
                        'h-4 w-4 shrink-0 text-text-muted transition-transform',
                        open && 'rotate-180',
                    )}
                    aria-hidden="true"
                />
            </button>

            {open && (
                <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-40 overflow-hidden rounded-md border border-border bg-white shadow-lg">
                    {showSearch && (
                        <div className="border-b border-border p-2">
                            <div className="relative">
                                <Search
                                    className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"
                                    aria-hidden="true"
                                />
                                <input
                                    ref={searchRef}
                                    type="text"
                                    value={query}
                                    onChange={(event) => {
                                        setQuery(event.target.value);
                                        setActiveIndex(0);
                                    }}
                                    placeholder="Cari..."
                                    className="h-8 w-full rounded-md border border-border bg-white pl-8 pr-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                />
                            </div>
                        </div>
                    )}

                    <ul
                        ref={listRef}
                        id={listboxId}
                        role="listbox"
                        className="max-h-60 overflow-y-auto p-1"
                    >
                        {filtered.map((option, index) => {
                            const isSelected = option.value === (value ?? '');

                            return (
                                <li
                                    key={`${option.value}-${index}`}
                                    role="option"
                                    aria-selected={isSelected}
                                    data-index={index}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onClick={() => choose(option)}
                                    className={cn(
                                        'flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm',
                                        index === activeIndex ? 'bg-bg-secondary text-text' : 'text-text',
                                    )}
                                >
                                    <span className="line-clamp-1 min-w-0 flex-1">{option.label}</span>
                                    {isSelected && (
                                        <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                                    )}
                                </li>
                            );
                        })}

                        {filtered.length === 0 && (
                            <li className="px-2 py-3 text-center text-sm text-text-muted">
                                Tidak ada pilihan
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
