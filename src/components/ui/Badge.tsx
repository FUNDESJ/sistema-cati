type BadgeVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-[#f4f4f4] text-[#3d3d3d] border border-[#d8d8d8]',
  primary: 'bg-[#fdf0f0] text-[#7b1113] border border-[#e5c6c8]',
  success: 'bg-[#e9f4ec] text-[#1d6b2f] border border-[#c9e2d0]',
  warning: 'bg-[#fbf3e0] text-[#8a5a00] border border-[#e8d9b0]',
  danger: 'bg-[#fbeaea] text-[#a61b1b] border border-[#ecc7c7]',
};

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5
        text-xs font-semibold leading-snug
        rounded
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, BadgeVariant> = {
    pendente: 'warning',
    homologada: 'success',
    nao_homologada: 'danger',
    duplicada: 'neutral',
    ativa: 'success',
    inativa: 'neutral',
  };

  const labels: Record<string, string> = {
    pendente: 'Pendente',
    homologada: 'Homologada',
    nao_homologada: 'Não homologada',
    duplicada: 'Duplicada',
    ativa: 'Ativa',
    inativa: 'Inativa',
  };

  return <Badge variant={variants[status] || 'neutral'}>{labels[status] || status}</Badge>;
}