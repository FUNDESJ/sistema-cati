

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, BadgeProps['variant']> = {
    pendente: 'warning',
    homologada: 'success',
    nao_homologada: 'danger',
    duplicada: 'default',
    ativa: 'success',
    inativa: 'default',
  };

  const labels: Record<string, string> = {
    pendente: 'Pendente',
    homologada: 'Homologada',
    nao_homologada: 'Não homologada',
    duplicada: 'Duplicada',
    ativa: 'Ativa',
    inativa: 'Inativa',
  };

  return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
}