// chat.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { WebSocketService } from './websocket.service';

interface ChatMessage {
  id: string;
  parentId: string | null;
  childrenIds: string[];
  role: 'user' | 'assistant' | 'system';
  content: string;
  files?: any[];
  timestamp: number;
  models?: string[];
  done?: boolean;
  error?: any;
  sources?: any[];
  statusHistory?: any[];
}

interface ChatHistory {
  messages: { [key: string]: ChatMessage };
  currentId: string;
}

interface UpdateChatPayload {
  models: string[];
  messages: any[];
  history: ChatHistory;
  params?: any;
  files?: any[];
  title?: string;
  tags?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  get headers() {
    // return (new HttpHeaders({
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    // }));
  }

  private apiToken = localStorage.getItem('token') || '';

  // Estados reactivos como en Svelte
  chatHistory = new BehaviorSubject<ChatHistory>({
    messages: {},
    currentId: '',
  });

  selectedModels = signal<Array<string>>([]);

  isProcessing = new BehaviorSubject<boolean>(false);
  public isProcessing$ = this.isProcessing.asObservable();

  constructor(
    private http: HttpClient,
    private websocketService: WebSocketService
  ) {}

  // Migrado de sendPromptSocket del código Svelte
  async sendMessage(
    chatId: string,
    userMessage: string,
    selectedModels: string[],
    files: any[] = [],
    selectedToolIds: string[] = [],
    selectedFilterIds: string[] = [],
    params: any = {},
    settings: any = {}
  ): Promise<Observable<any>> {
    const sessionId = this.websocketService.getSessionId();
    if (!sessionId) {
      throw new Error('No session ID available. WebSocket not connected.');
    }

    this.isProcessing.next(true);

    // Generar IDs como en el código Svelte
    const userMessageId = this.generateUUID();
    const responseMessageId = this.generateUUID();

    // Crear mensaje de usuario (equivalente al código Svelte)
    const currentHistory = this.chatHistory.value;
    const userMsg: ChatMessage = {
      id: userMessageId,
      parentId:
        Object.keys(currentHistory.messages).length !== 0
          ? currentHistory.currentId
          : null,
      childrenIds: [],
      role: 'user',
      content: userMessage,
      files: files.length > 0 ? files : undefined,
      timestamp: Math.floor(Date.now() / 1000),
      models: selectedModels,
    };

    // Crear mensaje de respuesta placeholder
    const responseMessage: ChatMessage = {
      id: responseMessageId,
      parentId: userMessageId,
      childrenIds: [],
      role: 'assistant',
      content: '',
      timestamp: Math.floor(Date.now() / 1000),
      done: false,
    };

    // Actualizar historial
    const updatedHistory: ChatHistory = {
      messages: {
        ...currentHistory.messages,
        [userMessageId]: userMsg,
        [responseMessageId]: responseMessage,
      },
      currentId: responseMessageId,
    };

    this.chatHistory.next(updatedHistory);

    // Crear lista de mensajes para la API (equivalente a createMessagesList)
    const messagesForAPI = this.createMessagesList(
      updatedHistory,
      userMessageId
    );

    return new Observable((observer) => {
      this.processCompletion(
        chatId,
        selectedModels[0], // Usar el primer modelo
        messagesForAPI,
        responseMessageId,
        sessionId,
        files,
        selectedToolIds,
        selectedFilterIds,
        params,
        settings
      )
        .then(() => {
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  // Migrado del proceso de completion del código Svelte

  // Modificar el método processCompletion para incluir la actualización
  private async processCompletion(
    chatId: string,
    modelId: string,
    messages: any[],
    responseMessageId: string,
    sessionId: string,
    files: any[],
    selectedToolIds: string[],
    selectedFilterIds: string[],
    params: any,
    settings: any
  ) {
    const stream =
      params?.stream_response ?? settings?.params?.stream_response ?? true;

    // Payload equivalente al del código Svelte
    const payload = {
      stream: stream,
      model: modelId,
      messages: messages,
      params: {
        ...settings?.params,
        ...params,
      },
      files: files.length > 0 ? files : undefined,
      filter_ids: selectedFilterIds.length > 0 ? selectedFilterIds : undefined,
      tool_ids: selectedToolIds.length > 0 ? selectedToolIds : undefined,

      // Campos específicos del código Svelte
      session_id: sessionId,
      chat_id: chatId,
      id: responseMessageId,

      background_tasks: {
        title_generation: settings?.title?.auto ?? true,
        tags_generation: settings?.autoTags ?? true,
        follow_up_generation: settings?.autoFollowUps ?? true,
      },

      ...(stream ? { stream_options: { include_usage: true } } : {}),
    };

    try {
      const response = await fetch(`https://gpt.sdi.es/api/chat/completions`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await this.handleStreamingResponse(
        response,
        responseMessageId,
        chatId,
        modelId,
        messages
      );

      // ✅ NUEVO: Actualizar chat después del streaming
      await this.saveChatAfterCompletion(chatId);
    } catch (error) {
      console.error('Error in completion:', error);
      this.handleCompletionError(error, responseMessageId);
      throw error;
    }
  }

  /**
   * Guarda el chat después de completar un mensaje
   * Equivalente a saveChatHandler del código Svelte [1]
   */
  private async saveChatAfterCompletion(chatId: string): Promise<void> {
    if (chatId === 'local') return; // No guardar chats temporales

    try {
      const currentHistory = this.chatHistory.value;
      const currentMessages = this.createMessagesList(
        currentHistory,
        currentHistory.currentId
      );

      await this.updateChatById(chatId, {
        models: this.selectedModels(),
        messages: currentMessages,
        history: currentHistory,
        // params: this.chatParams,
        // files: this.chatFiles,
      });

      console.log('Chat saved after completion');
    } catch (error) {
      console.error('Error saving chat after completion:', error);
      // No lanzar error para no interrumpir la UX
    }
  }

  // Manejo de streaming equivalente al código Svelte
  private async handleStreamingResponse(
    response: Response,
    responseMessageId: string,
    chatId: string,
    modelId: string,
    messages: any[]
  ) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No reader available');
    }

    let fullResponse = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          await this.callChatCompleted(
            chatId,
            modelId,
            responseMessageId,
            messages,
            fullResponse
          );
          this.markMessageAsComplete(responseMessageId);
          this.isProcessing.next(false);
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              await this.callChatCompleted(
                chatId,
                modelId,
                responseMessageId,
                messages,
                fullResponse
              );
              this.markMessageAsComplete(responseMessageId);
              this.isProcessing.next(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);

              // Manejar diferentes tipos de eventos como en el código Svelte
              if (parsed.choices && parsed.choices[0]) {
                const choice = parsed.choices[0];

                if (choice.delta && choice.delta.content) {
                  const content = choice.delta.content;
                  fullResponse += content;
                  this.updateMessageContent(responseMessageId, fullResponse);
                }

                if (choice.message && choice.message.content) {
                  fullResponse = choice.message.content;
                  this.updateMessageContent(responseMessageId, fullResponse);
                }
              }

              // Manejar sources si están presentes
              if (parsed.sources) {
                this.updateMessageSources(responseMessageId, parsed.sources);
              }
            } catch (e) {
              continue;
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      this.handleCompletionError(error, responseMessageId);
    }
  }

  // Equivalente a chatCompleted del código Svelte
  private async callChatCompleted(
    chatId: string,
    modelId: string,
    responseMessageId: string,
    messages: any[],
    fullResponse: string
  ) {
    const sessionId = this.websocketService.getSessionId();
    if (!sessionId) return;

    const payload = {
      model: modelId,
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        ...(m.sources ? { sources: m.sources } : {}),
      })),
      chat_id: chatId,
      session_id: sessionId,
      id: responseMessageId,
    };

    try {
      const response = await fetch(`https://gpt.sdi.es/api/chat/completed`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error('Error in chatCompleted:', response.status);
      }
    } catch (error) {
      console.error('Error calling chatCompleted:', error);
    }
  }

  // Métodos auxiliares
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private createMessagesList(history: ChatHistory, messageId: string): any[] {
    const messages: any[] = [];
    let currentId = messageId;

    while (currentId && history.messages[currentId]) {
      const message = history.messages[currentId];
      messages.unshift({
        role: message.role,
        content: message.content,
        ...(message.files ? { files: message.files } : {}),
      });
      currentId = message.parentId || '';
    }

    return messages;
  }

  private updateMessageContent(messageId: string, content: string) {
    const currentHistory = this.chatHistory.value;
    if (currentHistory.messages[messageId]) {
      currentHistory.messages[messageId].content = content;
      this.chatHistory.next({ ...currentHistory });
    }
  }

  private updateMessageSources(messageId: string, sources: any[]) {
    const currentHistory = this.chatHistory.value;
    if (currentHistory.messages[messageId]) {
      currentHistory.messages[messageId].sources = sources;
      this.chatHistory.next({ ...currentHistory });
    }
  }

  private markMessageAsComplete(messageId: string) {
    const currentHistory = this.chatHistory.value;
    if (currentHistory.messages[messageId]) {
      currentHistory.messages[messageId].done = true;
      this.chatHistory.next({ ...currentHistory });
    }
  }

  private handleCompletionError(error: any, responseMessageId: string) {
    const currentHistory = this.chatHistory.value;
    if (currentHistory.messages[responseMessageId]) {
      currentHistory.messages[responseMessageId].error = {
        content: `Error: ${error.message || error}`,
      };
      currentHistory.messages[responseMessageId].done = true;
      this.chatHistory.next({ ...currentHistory });
    }
    this.isProcessing.next(false);
  }

  /**
   * Actualiza un chat existente en Open WebUI
   * Equivalente a updateChatById del código Svelte [1]
   */
  async updateChatById(
    chatId: string,
    chatData: UpdateChatPayload
  ): Promise<any> {
    if (!chatId || chatId === 'local') {
      console.log('Skipping update for local/temporary chat');
      return null;
    }

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiToken}`,
    };

    const payload = {
      chat: {
        models: chatData.models,
        messages: chatData.messages,
        history: chatData.history,
        params: chatData.params || {},
        files: chatData.files || [],
        ...(chatData.title && { title: chatData.title }),
        ...(chatData.tags && { tags: chatData.tags }),
      },
    };

    try {
      const response = await fetch(`${environment.baseURL}/chats/${chatId}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HTTP ${response.status}: ${errorData.detail || response.statusText}`
        );
      }

      const result = await response.json();
      console.log('Chat updated successfully:', chatId);
      return result;
    } catch (error) {
      console.error('Error updating chat:', error);
      throw error;
    }
  }

  /**
   * Versión simplificada para actualizaciones rápidas
   */
  async quickUpdateChat(
    chatId: string,
    updates: Partial<UpdateChatPayload>
  ): Promise<void> {
    try {
      const currentHistory = this.chatHistory.value;
      const currentMessages = this.createMessagesList(
        currentHistory,
        currentHistory.currentId
      );

      await this.updateChatById(chatId, {
        models: this.selectedModels(),
        messages: currentMessages,
        history: currentHistory,
        ...updates,
      });
    } catch (error) {
      // No lanzar error para no interrumpir la UX, solo loggear
      console.error('Quick update failed:', error);
    }
  }
}
