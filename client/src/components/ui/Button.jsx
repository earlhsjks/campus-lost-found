export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  icon: Icon,
  as: Component = 'button',
  ...props 
}) {
  const variants = {
    primary: 'bg-gradient-accent text-accent-foreground hover:shadow-accent-lg hover:-translate-y-0.5 active:scale-[0.98]',
    secondary: 'border border-border bg-muted text-foreground hover:bg-muted/80 hover:border-accent/30',
    ghost: 'text-muted-foreground hover:text-foreground',
    outline: 'border-2 border-accent text-accent hover:bg-accent/5',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base h-12',
    lg: 'px-8 py-4 text-lg h-14',
  };

  return (
    <Component
      className={`btn-base ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 mr-2" />}
      {children}
    </Component>
  );
}
