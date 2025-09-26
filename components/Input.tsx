// app/components/Input.tsx
import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string, hint?: string };

export default function Input({ label, hint, className = '', ...rest }: Props) {
    return (
        <label className="block text-sm">
            {label && <div className="text-slate-200 mb-1 font-medium">{label}</div>}
            <input className={`input focus-ring ${className}`} {...rest} />
            {hint && <div className="small-muted mt-1">{hint}</div>}
        </label>
    );
}
