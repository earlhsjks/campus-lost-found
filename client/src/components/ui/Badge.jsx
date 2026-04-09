export function Badge({ children, variant = 'primary', pulsing = false, className = '', ...props }) {
  const variants = {
    primary: 'bg-accent/10 text-accent border border-accent/30',
    secondary: 'bg-muted text-muted-foreground border border-border',
    success: 'bg-green-50 text-green-700 border border-green-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${variants[variant]} ${pulsing ? 'animate-pulse' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children, className = '' }) {
  return (
    <div className={`section-label ${className}`}>
      <span className="section-label-dot animate-pulse-accent"></span>
      <span className="font-mono text-xs uppercase tracking-widest">{children}</span>
    </div>
  );
}
