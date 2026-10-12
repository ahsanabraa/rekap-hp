/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
    './storage/framework/views/*.php',
    './resources/views/**/*.blade.php',
    './resources/js/**/*.jsx',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--color-primary))',
          hover: 'hsl(var(--color-primary-hover))',
          light: 'hsl(var(--color-primary-light))',
        },
        success: {
          DEFAULT: 'hsl(var(--color-success))',
          light: 'hsl(var(--color-success-light))',
        },
        warning: {
          DEFAULT: 'hsl(var(--color-warning))',
          light: 'hsl(var(--color-warning-light))',
        },
        danger: {
          DEFAULT: 'hsl(var(--color-danger))',
          light: 'hsl(var(--color-danger-light))',
        },
        bg: {
          DEFAULT: 'hsl(var(--color-bg))',
          secondary: 'hsl(var(--color-bg-secondary))',
          tertiary: 'hsl(var(--color-bg-tertiary))',
        },
        text: {
          DEFAULT: 'hsl(var(--color-text))',
          secondary: 'hsl(var(--color-text-secondary))',
          muted: 'hsl(var(--color-text-muted))',
        },
        border: {
          DEFAULT: 'hsl(var(--color-border))',
          strong: 'hsl(var(--color-border-strong))',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },
    },
  },
  plugins: [],
};