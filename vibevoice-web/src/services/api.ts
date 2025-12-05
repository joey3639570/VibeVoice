export interface Config {
    voices: string[];
    default_voice: string | null;
}

export interface LogMessage {
    type: 'log';
    event: string;
    data: any;
    timestamp: string;
}

export const fetchConfig = async (): Promise<Config> => {
    const response = await fetch('/config');
    if (!response.ok) {
        throw new Error('Failed to fetch config');
    }
    return response.json();
};

export class TTSWebSocket {
    private ws: WebSocket | null = null;
    private url: string;
    private onMessage: (data: any) => void;
    private onOpen: () => void;
    private onClose: () => void;
    private onError: (error: Event) => void;

    constructor(
        url: string,
        callbacks: {
            onMessage: (data: any) => void;
            onOpen: () => void;
            onClose: () => void;
            onError: (error: Event) => void;
        }
    ) {
        // Construct absolute URL for WebSocket if relative path provided
        if (url.startsWith('/')) {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            this.url = `${protocol}//${window.location.host}${url}`;
        } else {
            this.url = url;
        }
        this.onMessage = callbacks.onMessage;
        this.onOpen = callbacks.onOpen;
        this.onClose = callbacks.onClose;
        this.onError = callbacks.onError;
    }

    connect(params: { text: string; cfg: number; steps: number; voice: string }) {
        const queryParams = new URLSearchParams({
            text: params.text,
            cfg: params.cfg.toString(),
            steps: params.steps.toString(),
            voice: params.voice,
        });

        this.ws = new WebSocket(`${this.url}?${queryParams.toString()}`);
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
            this.onOpen();
        };

        this.ws.onmessage = (event) => {
            this.onMessage(event.data);
        };

        this.ws.onclose = () => {
            this.onClose();
        };

        this.ws.onerror = (error) => {
            this.onError(error);
        };
    }

    close() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
