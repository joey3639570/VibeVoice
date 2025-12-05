import React from 'react';
import { MessageSquare } from 'lucide-react';

interface TTSInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export const TTSInput: React.FC<TTSInputProps> = ({ value, onChange, disabled }) => {
    return (
        <div className="flex flex-col gap-2 h-full">
            <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <MessageSquare size={16} className="text-primary" />
                Input Text
            </label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                placeholder="Enter your text here to generate speech..."
                className="w-full flex-1 min-h-[160px] bg-background/50 border border-border rounded-xl p-4 text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-text-muted/60"
            />
            <div className="text-xs text-text-muted text-right">
                {value.length} characters
            </div>
        </div>
    );
};
