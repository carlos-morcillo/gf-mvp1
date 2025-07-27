// websocket.service.ts (versión final)
import { Injectable } from '@angular/core';
import { uniqueId } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: Socket | null = null;
  private sessionId = new BehaviorSubject<string | null>(null);
  public sessionId$ = this.sessionId.asObservable();

  constructor() {
    // this.initializeSocket();
  }

  private initializeSocket() {
    // const wsUrl = this.configService.getWebSocketUrl();
    console.log('Connecting WebSocket to:', environment.wsURL);
    const enableWebsocket = true;
    this.socket = io(environment.wsURL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      path: '/ws/socket.io',
      transports: enableWebsocket ? ['websocket'] : ['polling', 'websocket'],
      auth: { token: localStorage.getItem('token') },
    });

    // Event handlers como antes...
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected to Open WebUI');
      console.log('Session ID:', this.socket?.id);
      this.sessionId.next(this.socket?.id || null);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.sessionId.next(null);
    });

    this.socket.on('connect_error', (error) => {
      debugger;
      console.error('🔥 WebSocket connection error:', error);
      console.log(`Trying to connect to: ${environment.wsURL}`);
    });

    // Eventos específicos de Open WebUI [1]
    this.socket.on('chat-events', this.handleChatEvent.bind(this));
  }

  private handleChatEvent(event: any) {
    // Implementación basada en el chatEventHandler del código Svelte [1]
    console.log('📨 Chat event received:', event);

    if (event.chat_id && event.message_id) {
      // Aquí puedes emitir eventos para que otros componentes los escuchen
      // Por ejemplo, usando un Subject para comunicar cambios
    }
  }

  getSessionId(): string | null {
    return uniqueId('asdf');
    return this.socket?.id || null;
  }

  isConnected(): boolean {
    return true;
    return this.socket?.connected || false;
  }

  waitForConnection(): Promise<string> {
    return Promise.resolve(this.getSessionId()!);
    return new Promise((resolve, reject) => {
      if (this.isConnected() && this.getSessionId()) {
        resolve(this.getSessionId()!);
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, 10000);

      this.sessionId$.subscribe((sessionId) => {
        if (sessionId) {
          clearTimeout(timeout);
          resolve(sessionId);
        }
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.sessionId.next(null);
    }
  }
}
