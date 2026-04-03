import { cn } from '@/utilities/ui'
import * as React from 'react'

import styles from './label.module.css'

const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement> & { ref?: React.Ref<HTMLLabelElement> }> = ({
  className,
  ref,
  ...props
}) => (
  <label
    className={cn(styles.label, className)}
    ref={ref}
    {...props}
  />
)

export { Label }
