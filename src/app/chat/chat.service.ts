// chat.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, resource, signal } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { PinnedChat } from '../private/layout/pinned-chat';
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

  private pinnedChatsResource = resource({
    loader: () =>
      firstValueFrom(
        this.http.get<PinnedChat[]>(`${environment.baseURL}/chats/pinned`)
      ),
  });

  readonly pinnedChats = this.pinnedChatsResource.value;
  readonly isLoadingPinned = this.pinnedChatsResource.isLoading;

  /** Pin a chat and refresh the pinned list */
  async pinChat(chatId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.baseURL}/chats/${chatId}/pin`, {})
    );
    this.pinnedChatsResource.reload();
  }

  /** Unpin a chat and refresh the pinned list */
  async unpinChat(chatId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${environment.baseURL}/chats/${chatId}/unpin`, {})
    );
    this.pinnedChatsResource.reload();
  }

  /** Check if chat is currently pinned */
  isPinned(chatId: string | number | null | undefined): boolean {
    return this.pinnedChats()?.some((c) => c.id === String(chatId)) ?? false;
  }

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

    // return new Observable((observer) => {
    const result = await this.processCompletion(
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
        debugger;
        //   observer.complete();
      })
      .catch((error) => {
        debugger;

        //   observer.error(error);
      });
    // });
    await this.saveChatAfterCompletion(chatId);
    return of(result);
  }

  // Modificar processCompletion para NO llamar saveChatAfterCompletion aquí
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

      if (!response.ok || !response.body) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // ✅ SOLO manejar el streaming, el guardado se hace DENTRO de handleStreamingResponse
      return new Promise<string>(async (resolve, reject) => {
        try {
          debugger;
          const reader = response.body!.getReader();
          const decoder = new TextDecoder('utf-8');
          let text = '';
          let assistantId: string | undefined;
          let partial = '';
          let done = false;

          while (!done) {
            const { value, done: streamDone } = await reader.read();
            done = streamDone;
            if (value) {
              partial += decoder.decode(value, { stream: true });
              const parts = partial.split('\n\n');
              partial = parts.pop() ?? '';
              for (const chunk of parts) {
                if (!chunk.startsWith('data: ')) continue;
                const data = chunk.slice(6).trim();
                if (data === '[DONE]') {
                  debugger;
                  done = true;
                  reader.releaseLock();
                  resolve(text);
                  return;
                }
                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta;
                  if (delta?.content) {
                    console.log(delta.content);
                    text += delta.content;
                  }
                  assistantId = assistantId ?? parsed.id;
                } catch (e) {
                  // ignore parse errors
                }
              }
            }
          }
          reader.releaseLock();
          resolve(text);
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error in completion:', error);
      this.handleCompletionError(error, responseMessageId);
      throw error;
    }
  }

  // ✅ CORREGIR handleStreamingResponse para guardar AL FINAL
  private async handleStreamingResponse(
    response: Response,
    responseMessageId: string,
    chatId: string,
    modelId: string,
    messages: any[]
  ) {
    debugger;
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
          // ✅ AQUÍ es donde debe ir el guardado - cuando el streaming termina
          console.log(
            'Streaming completed. Full response length:',
            fullResponse.length
          );

          await this.callChatCompleted(
            chatId,
            modelId,
            responseMessageId,
            messages,
            fullResponse
          );

          this.markMessageAsComplete(responseMessageId);

          // ✅ GUARDAR DESPUÉS de que todo esté completo
          await this.saveChatAfterCompletion(chatId);

          this.isProcessing.next(false);
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              debugger;
              // ✅ TAMBIÉN aquí cuando recibimos [DONE]
              console.log(
                'Received [DONE]. Full response length:',
                fullResponse.length
              );

              await this.callChatCompleted(
                chatId,
                modelId,
                responseMessageId,
                messages,
                fullResponse
              );

              this.markMessageAsComplete(responseMessageId);

              // ✅ GUARDAR DESPUÉS de que todo esté completo
              await this.saveChatAfterCompletion(chatId);

              this.isProcessing.next(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);

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

  // ✅ ASEGURAR que saveChatAfterCompletion usa el estado más actualizado
  private async saveChatAfterCompletion(chatId: string): Promise<void> {
    if (chatId === 'local') return;

    try {
      // ✅ ESPERAR un poco para asegurar que el estado se haya actualizado
      await new Promise((resolve) => setTimeout(resolve, 100));

      const currentHistory = this.chatHistory.value;
      console.log('Saving chat. Current history:', {
        currentId: currentHistory.currentId,
        messageCount: Object.keys(currentHistory.messages).length,
        lastMessage: currentHistory.messages[currentHistory.currentId],
      });

      const currentMessages = this.createMessagesList(
        currentHistory,
        currentHistory.currentId
      );

      console.log(
        'Messages to save:',
        currentMessages.map((m) => ({
          id: m.id,
          role: m.role,
          contentLength: m.content?.length || 0,
          content: m.content?.substring(0, 100) + '...',
        }))
      );

      await this.updateChatById(chatId, {
        models: this.selectedModels(),
        messages: currentMessages,
        history: currentHistory,
      });

      console.log('Chat saved successfully after completion');
    } catch (error) {
      console.error('Error saving chat after completion:', error);
    }
  }

  // ✅ ASEGURAR que updateMessageContent actualiza correctamente
  private updateMessageContent(messageId: string, content: string) {
    const currentHistory = this.chatHistory.value;
    if (currentHistory.messages[messageId]) {
      // ✅ CREAR una nueva referencia para triggerar la reactividad
      const updatedMessage = {
        ...currentHistory.messages[messageId],
        content: content,
      };

      const updatedHistory = {
        ...currentHistory,
        messages: {
          ...currentHistory.messages,
          [messageId]: updatedMessage,
        },
      };

      this.chatHistory.next(updatedHistory);

      // ✅ LOG para debugging
      console.log(
        `Updated message ${messageId} content length:`,
        content.length
      );
    }
  }

  // ✅ ASEGURAR que markMessageAsComplete funciona correctamente
  private markMessageAsComplete(messageId: string) {
    const currentHistory = this.chatHistory.value;
    if (currentHistory.messages[messageId]) {
      const updatedMessage = {
        ...currentHistory.messages[messageId],
        done: true,
      };

      const updatedHistory = {
        ...currentHistory,
        messages: {
          ...currentHistory.messages,
          [messageId]: updatedMessage,
        },
      };

      this.chatHistory.next(updatedHistory);

      console.log(
        `Marked message ${messageId} as complete. Content length:`,
        updatedMessage.content?.length || 0
      );
    }
  }

  //

  // Métodos auxiliares
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private updateMessageSources(messageId: string, sources: any[]) {
    const currentHistory = this.chatHistory.value;
    if (currentHistory.messages[messageId]) {
      currentHistory.messages[messageId].sources = sources;
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

  /**
   * Crear lista de mensajes manteniendo IDs - equivalente al createMessagesList de Svelte [1]
   */
  private createMessagesList(history: ChatHistory, messageId: string): any[] {
    const messages: any[] = [];
    let currentId = messageId;

    // Reconstruir la cadena de mensajes desde el messageId hacia atrás
    const messageChain: any[] = [];
    while (currentId && history.messages[currentId]) {
      messageChain.unshift(history.messages[currentId]);
      currentId = history.messages[currentId].parentId || '';
    }

    // Convertir a formato API manteniendo los IDs originales
    return messageChain.map((message) => ({
      id: message.id, // ✅ MANTENER el ID original
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
      ...(message.files ? { files: message.files } : {}),
      ...(message.sources ? { sources: message.sources } : {}),
      ...(message.info ? { info: message.info } : {}),
    }));
  }

  /**
   * Actualizar updateChatById para usar la estructura correcta
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

    // ✅ ESTRUCTURA CORRECTA: como en el código Svelte [2]
    const payload = {
      chat: {
        models: chatData.models,
        messages: chatData.messages, // Ya incluyen los IDs correctos
        history: chatData.history, // Estructura completa con IDs
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
   * Corregir callChatCompleted para usar IDs correctos
   */
  private async callChatCompleted(
    chatId: string,
    modelId: string,
    responseMessageId: string,
    messages: any[],
    fullResponse: string
  ) {
    const sessionId = this.websocketService.getSessionId();
    if (!sessionId) return;

    // ✅ ESTRUCTURA CORRECTA: como en el código Svelte [1]
    const payload = {
      model: modelId,
      messages: messages.map((m) => ({
        id: m.id, // ✅ MANTENER ID original
        role: m.role,
        content: m.content,
        info: m.info ? m.info : undefined,
        timestamp: m.timestamp,
        ...(m.usage ? { usage: m.usage } : {}),
        ...(m.sources ? { sources: m.sources } : {}),
      })),
      filter_ids: [], // selectedFilterIds si los tienes
      model_item: {}, // $models.find((m) => m.id === modelId) si tienes la lista
      chat_id: chatId,
      session_id: sessionId,
      id: responseMessageId,
    };

    try {
      const response = await fetch(`https://gpt.sdi.es/api/chat/completed`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error('Error in chatCompleted:', response.status);
      }
    } catch (error) {
      console.error('Error calling chatCompleted:', error);
    }
  }
}
