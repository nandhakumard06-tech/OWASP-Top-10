import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-[var(--osa-accent)] text-[#04121a] hover:brightness-110 active:brightness-95 font-semibold shadow-[0_10px_30px_-14px_var(--osa-accent)]',
  secondary:
    'bg-[var(--osa-card)] text-[var(--osa-text)] border border-[var(--osa-border)] hover:bg-[var(--osa-hover)]',
  ghost: 'bg-transparent text-[var(--osa-text)] hover:bg-[var(--osa-hover)]',
  danger:
    'bg-[var(--osa-critical)] text-white hover:brightness-110 font-semibold',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

const BASE =
  'inline-flex items-center justify-center rounded-xl transition-[filter,background-color,box-shadow,transform] duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', iconLeft, iconRight, fullWidth, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={rest.type ?? 'button'}
      className={cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
});

export interface ButtonLinkProps {
  to: string;
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
  /** Set for links that leave the site, so they open in a new tab safely. */
  external?: boolean;
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth,
  className,
  children,
  external,
}: ButtonLinkProps) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className);

  if (external) {
    return (
      <a className={classes} href={to} target="_blank" rel="noopener noreferrer">
        {iconLeft}
        {children}
        {iconRight}
      </a>
    );
  }

  return (
    <Link className={classes} to={to}>
      {iconLeft}
      {children}
      {iconRight}
    </Link>
  );
}
