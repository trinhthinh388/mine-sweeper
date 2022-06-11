import React from 'react';
import { mergeClassname } from 'utils/helpers';

// Styles
import styles from './styles.module.scss';

export type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={mergeClassname(styles.button, className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
