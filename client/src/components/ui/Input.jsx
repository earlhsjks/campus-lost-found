import { forwardRef } from 'react';

export const Input = forwardRef(
  ({ type = 'text', placeholder, error, label, helperText, icon: Icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          )}
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            className={`
              w-full px-4 py-2.5 rounded-lg
              border-2 border-border
              bg-background text-foreground placeholder-muted-foreground
              transition-all duration-200
              focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10
              hover:border-border/60
              disabled:opacity-50 disabled:cursor-not-allowed
              ${Icon ? 'pl-10' : ''}
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {helperText && (
          <p className={`text-xs mt-1 ${error ? 'text-red-500' : 'text-muted-foreground'}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = forwardRef(
  ({ placeholder, error, label, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          placeholder={placeholder}
          className={`
            w-full px-4 py-2.5 rounded-lg
            border-2 border-border
            bg-background text-foreground placeholder-muted-foreground
            transition-all duration-200
            focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10
            hover:border-border/60
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-vertical min-h-32
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
            ${className}
          `}
          {...props}
        />
        {helperText && (
          <p className={`text-xs mt-1 ${error ? 'text-red-500' : 'text-muted-foreground'}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export const Select = forwardRef(
  ({ options = [], label, error, helperText, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-lg appearance-none
            border-2 border-border
            bg-background text-foreground
            transition-all duration-200
            focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10
            hover:border-border/60
            disabled:opacity-50 disabled:cursor-not-allowed
            cursor-pointer
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {helperText && (
          <p className={`text-xs mt-1 ${error ? 'text-red-500' : 'text-muted-foreground'}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
