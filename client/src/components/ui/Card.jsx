export function Card({ children, className = '', featured = false, ...props }) {
  if (featured) {
    return (
      <div className={`rounded-xl bg-gradient-accent p-[2px] ${className}`} {...props}>
        <div className="h-full w-full rounded-[calc(12px-2px)] bg-card p-6 sm:p-8">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`card-base p-6 sm:p-8 hover:shadow-lg hover:border-accent/20 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-xl sm:text-2xl font-bold text-foreground ${className}`}>{children}</h3>;
}

export function CardDescription({ children, className = '' }) {
  return <p className={`text-sm text-muted-foreground mt-2 ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }) {
  return <div className={`text-foreground ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`mt-6 border-t border-border pt-4 ${className}`}>{children}</div>;
}
