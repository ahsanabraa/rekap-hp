import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary: 'bg-[hsl(var(--color-primary))] text-white hover:bg-[hsl(var(--color-primary-hover))] active:bg-[hsl(var(--color-primary-hover))]',
                success: 'bg-[hsl(var(--color-success))] text-white hover:bg-[hsl(142 71% 40%)] active:bg-[hsl(142 71% 40%)]',
                warning: 'bg-[hsl(var(--color-warning))] text-white hover:bg-[hsl(38 92% 45%)] active:bg-[hsl(38 92% 45%)]',
                danger: 'bg-[hsl(var(--color-danger))] text-white hover:bg-[hsl(0 84% 55%)] active:bg-[hsl(0 84% 55%)]',
                secondary: 'bg-[hsl(var(--color-bg-tertiary))] text-[hsl(var(--color-text))] border border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-border))] active:bg-[hsl(var(--color-border))]',
                outline: 'border border-[hsl(var(--color-border))] bg-transparent hover:bg-[hsl(var(--color-bg-tertiary))] active:bg-[hsl(var(--color-bg-tertiary))]',
                ghost: 'bg-transparent hover:bg-[hsl(var(--color-bg-tertiary))] active:bg-[hsl(var(--color-bg-tertiary))]',
                link: 'text-[hsl(var(--color-primary))] underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-9 rounded-[var(--radius-md)] px-3',
                xs: 'h-8 rounded-[var(--radius-sm)] px-2.5 text-xs',
                lg: 'h-11 rounded-[var(--radius-md)] px-8',
                xl: 'h-12 rounded-[var(--radius-md)] px-10',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'default',
        },
    }
);

export function Button({ className, variant, size, asChild = false, ...props }) {
    const Comp = asChild ? Slot : 'button';
    return (
        <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}