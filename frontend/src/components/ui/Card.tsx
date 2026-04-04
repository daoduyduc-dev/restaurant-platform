import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn } from './Button';

interface BaseProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onAnimationStart' | 'onDragStart' | 'onDragEnd'> {
  variant?: 'default' | 'elevated' | 'bordered';
  hover?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

const CardRoot = ({ className, variant = 'default', hover = false, children, ...rest }: CardProps) => {
  const variantClasses = {
    default: 'card-default',
    elevated: 'card-elevated',
    bordered: 'card-bordered'
  };

  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      className={cn("card", variantClasses[variant], hover && 'card-hover', className)}
      {...rest as HTMLMotionProps<"div">}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ className, children, ...rest }: BaseProps) => (
  <div className={cn("card-header", className)} {...rest}>{children}</div>
);

export const CardTitle = ({ className, children, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("card-title", className)} {...rest}>{children}</h3>
);

export const CardDescription = ({ className, children, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("card-description", className)} {...rest}>{children}</p>
);

export const CardContent = ({ className, children, ...rest }: BaseProps) => (
  <div className={cn("card-content", className)} {...rest}>{children}</div>
);

export const CardFooter = ({ className, children, ...rest }: BaseProps) => (
  <div className={cn("card-footer", className)} {...rest}>{children}</div>
);

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
});
