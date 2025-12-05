import React from 'react';
import { Sliders, Zap } from 'lucide-react';

interface ControlsProps {
    cfg: number;
    setCfg: (val: number) => void;
    steps: number;
    setSteps: (val: number) => void;
    disabled?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
    cfg,
    setCfg,
    steps,
    setSteps,
    disabled,
}) => {
    return (
        <div className="flex flex-col gap-6 p-5 bg-background/30 rounded-xl border border-border/50">
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
                        <Sliders size={16} className="text-primary" />
                        CFG Scale
                    </label>
                    <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {cfg.toFixed(2)}
                    </span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={cfg}
                    onChange={(e) => setCfg(parseFloat(e.target.value))}
                    disabled={disabled}
                    className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-text-primary flex items-center gap-2">
                        <Zap size={16} className="text-primary" />
                        Inference Steps
                    </label>
                    <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {steps}
                    </span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={steps}
                    onChange={(e) => setSteps(parseInt(e.target.value))}
                    disabled={disabled}
                    className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>
        </div>
    );
};
