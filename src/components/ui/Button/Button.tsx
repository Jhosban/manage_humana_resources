import type { ReactNode } from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';

export interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'middle' | 'large';
  fullWidth?: boolean;
  buttonType?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  [key: string]: any; // Para permitir otros props de AntButton
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'middle',
  fullWidth = false,
  buttonType = 'button',
  className,
  style,
  ...props
}: ButtonProps) => {
  // Mapear nuestras variantes a los tipos de Ant Design
  const getAntType = (): AntButtonProps['type'] => {
    switch (variant) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'default';
      case 'outline':
        return 'default';
      case 'ghost':
        return 'text';
      case 'danger':
        return 'primary';
      default:
        return 'primary';
    }
  };

  const combinedStyle = {
    ...style,
    ...(fullWidth && { width: '100%' }),
    ...(variant === 'danger' && { backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }),
    // Aseguramos que los botones outline sean siempre visibles con un borde más definido
    ...(variant === 'outline' && { 
      borderColor: '#1890ff',
      color: '#1890ff',
      borderWidth: '1px',
      opacity: 1
    }),
  };

  return (
    <AntButton
      type={getAntType()}
      size={size}
      htmlType={buttonType as any}
      className={className}
      style={combinedStyle}
      danger={variant === 'danger'}
      ghost={variant === 'outline'}
      {...props}
    >
      {children}
    </AntButton>
  );
};
