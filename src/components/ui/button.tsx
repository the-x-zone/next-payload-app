import { cn } from '@/utilities/ui'
import * as React from 'react'

import styles from './button.module.css'

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'clear'

export interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClass: Record<ButtonVariant, string> = {
  default: styles['btn--default'],
  destructive: styles['btn--destructive'],
  outline: styles['btn--outline'],
  secondary: styles['btn--secondary'],
  ghost: styles['btn--ghost'],
  link: styles['btn--link'],
}

const sizeClass: Record<ButtonSize, string> = {
  default: styles['btn--default-size'],
  sm: styles['btn--sm'],
  lg: styles['btn--lg'],
  icon: styles['btn--icon'],
  clear: styles['btn--clear'],
}

export function getButtonClassName(variant: ButtonVariant = 'default', size: ButtonSize = 'default', className?: string) {
  return cn(styles.btn, variantClass[variant], sizeClass[size], className)
}

const Button: React.FC<ButtonProps> = ({ className, size = 'default', variant = 'default', ...props }) => {
  return (
    <button
      data-slot="button"
      className={getButtonClassName(variant, size, className)}
      {...props}
    />
  )
}

export { Button }
