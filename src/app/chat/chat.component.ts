// chat.component.ts
import { AsyncPipe, DatePipe, JsonPipe } from '@angular/common';
import {
  Component,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AgentChat } from '../private/agent-chat/agent-chat.model';
import { ChatService } from './chat.service';
import { WebSocketService } from './websocket.service';

@Component({
  selector: 'app-chat',
  imports: [DatePipe, AsyncPipe, FormsModule, JsonPipe],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  readonly chatId = input<string | null>(null);
  readonly chat = input<AgentChat>();

  chatEffect = effect(() => {
    const chat = this.chat();
    if (!chat) {
      return;
    }

    this.chatHistory$.next({
      messages: chat.chat.messages.reduce((acc, c) => {
        return { ...acc, [c.id!]: c };
      }, {}),
      currentId: chat.chat.messages.at(-1)!.id!,
    });

    this.chatService.selectedModels.set(chat.chat.models ?? []);
  });

  currentMessage: string = '';
  files: any[] = [];
  chatService = inject(ChatService);
  websocketService = inject(WebSocketService);

  chatHistory$ = this.chatService.chatHistory;
  isProcessing$ = this.chatService.isProcessing$;
  sessionId$ = this.websocketService.sessionId$;

  private subscriptions = new Subscription();

  async ngOnInit() {
    // Suscribirse a cambios del historial
    this.subscriptions.add(
      this.chatHistory$.subscribe((history) => {
        console.log('Chat history updated:', history);
      })
    );

    // Esperar a que el WebSocket se conecte antes de permitir enviar mensajes
    try {
      const sessionId = await this.websocketService.waitForConnection();
      console.log('Ready to chat with session:', sessionId);
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      // Mostrar mensaje de error al usuario
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.websocketService.disconnect();
  }

  async sendMessage() {
    // Verificar conexión antes de enviar
    if (!this.websocketService.isConnected()) {
      console.error('WebSocket not connected');
      return;
    }

    if (!this.currentMessage.trim()) return;

    const message = this.currentMessage;
    this.currentMessage = '';

    try {
      const messageObservable = await this.chatService.sendMessage(
        this.chatId()!,
        message,
        this.chatService.selectedModels(),
        this.files,
        [], // selectedToolIds
        [], // selectedFilterIds
        {}, // params
        {} // settings
      );

      this.subscriptions.add(
        messageObservable.subscribe({
          complete: () => {
            console.log('Message sent successfully');
          },
          error: (error) => {
            console.error('Error sending message:', error);
          },
        })
      );
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Obtener array de mensajes ordenados para mostrar en template
  getOrderedMessages(history: any) {
    if (!history?.messages) return [];

    const messages = [];
    let currentId = history.currentId;

    // Reconstruir la cadena de mensajes desde el más reciente hacia atrás
    const messageChain = [];
    while (currentId && history.messages[currentId]) {
      messageChain.unshift(history.messages[currentId]);
      currentId = history.messages[currentId].parentId;
    }

    return messageChain;
  }

  onFileSelected(event: any) {
    // Manejar selección de archivos
    const files = event.target.files;
    // Implementar lógica de upload de archivos
  }

  /**
   * Actualizar chat cuando cambian los modelos seleccionados
   */
  async updateSelectedModels(
    chatId: string,
    newModels: string[]
  ): Promise<void> {
    this.chatService.selectedModels.set(newModels);

    if (chatId !== 'local') {
      await this.chatService.quickUpdateChat(chatId, { models: newModels });
    }
  }

  /**
   * Actualizar chat cuando se agregan/quitan archivos
   */
  async updateChatFiles(chatId: string, newFiles: any[]): Promise<void> {
    // this.chatFiles = newFiles;
    // if (chatId !== 'local') {
    //   await this.chatService.quickUpdateChat(chatId, { files: newFiles });
    // }
  }

  /**
   * Actualizar parámetros del chat
   */
  async updateChatParams(chatId: string, newParams: any): Promise<void> {
    // this.chatParams = { ...this.chatParams, ...newParams };
    // if (chatId !== 'local') {
    //   await this.chatService.quickUpdateChat(chatId, { params: this.chatParams });
    // }
  }
}
