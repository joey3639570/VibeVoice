import React from 'react';
import { Mic } from 'lucide-react';

interface VoiceSelectorProps {
    voices: string[];
    selectedVoice: string;
    onChange: (voice: string) => void;
    disabled?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
    voices,
    selectedVoice,
    onChange,
    disabled,
}) => {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Mic size={16} className="text-primary" />
                Speaker Voice
            </label>
            <div className="relative">
                <select
                    value={selectedVoice}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="w-full appearance-none bg-surface border border-border rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {voices.length === 0 ? (
                        <option value="">Loading voices...</option>
                    ) : (
                        voices.map((voice) => (
                            <option key={voice} value={voice}>
                                {voice}
                            </option>
                        ))
                    )}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        </div>
    );
};
