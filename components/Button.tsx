// app/components/Button.tsx
import React from 'react';

export default function Button({ children, className = '', ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button {...rest} className={`btn-accent ${className}`}>
            {children}
        </button>
    );
}
