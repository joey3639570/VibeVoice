import React from 'react';
import { Activity } from 'lucide-react';

export const Header: React.FC = () => {
    return (
        <header className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Activity className="text-white" size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                    VibeVoice
                </h1>
                <p className="text-sm text-text-muted font-medium">
                    Real-time Frontier Voice AI
                </p>
            </div>
        </header>
    );
};
