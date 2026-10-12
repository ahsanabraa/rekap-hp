import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:ring-offset-2',
    {
        variants: {
            variant: {
                primary: 'border-transparent bg-[hsl(var(--color-primary-light))] text-[hsl(var(--color-primary))]',
                success: 'border-transparent bg-[hsl(var(--color-success-light))] text-[hsl(var(--color-success))]',
                warning: 'border-transparent bg-[hsl(var(--color-warning-light))] text-[hsl(var(--color-warning))]',
                danger: 'border-transparent bg-[hsl(var(--color-danger-light))] text-[hsl(var(--color-danger))]',
                neutral: 'bg-[hsl(var(--color-bg-tertiary))] text-[hsl(var(--color-text-secondary))] border border-[hsl(var(--color-border))]',
            },
        },
        defaultVariants: {
            variant: 'primary',
        },
    }
);

export function Badge({ className, variant, ...props }) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}