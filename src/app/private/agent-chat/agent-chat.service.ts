import { Injectable, WritableSignal, computed, signal } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../../environments/environment';
import { CollectionService } from '../../shared/services';
import { PagedDataRequestParam } from '../../shared/types/paged-data-request-param';
import { AgentChat, Message } from './agent-chat.model';

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
  current_id: string | null;
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

@Injectable({ providedIn: 'root' })
export class AgentChatService extends CollectionService<AgentChat> {
  protected override path = 'chats';

  get headers() {
    // return (new HttpHeaders({
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };
    // }));
  }

  /** In-memory message history */
  readonly messages: WritableSignal<Message[]> = signal([]);

  history = computed(() => {
    const messages = this.messages() ?? [];
    const lastMessage = messages.at(-1);
    return {
      messages: messages.reduce((acc, v) => {
        if (!v?.id) {
          debugger;
        }
        return { ...acc, [v.id!.toString()]: v };
      }, {}),
      current_id: lastMessage?.id ?? null,
    };
  });

  streaming = signal<boolean>(false);
  stream = signal<string | null>(null);

  /** Flag indicating that a request is in progress */
  readonly sending = signal(false);

  override list(
    request: Partial<PagedDataRequestParam> = {}
  ): Observable<AgentChat[]> {
    return this.http.get<AgentChat[]>(
      `${environment.baseURL}/${this.path}/all`
    );
  }

  /**
   * Creates a chat on Open WebUI using the provided agent and first message.
   * An empty assistant message is injected so that the backend registers the
   * assistant's response in the history.
   */
  async createChatWithAgent(
    agentId: string,
    initialMessage: string
  ): Promise<AgentChat> {
    this.sending.set(true);
    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
    };
    const messages: Message[] = [
      { id: uuidv4(), role: 'user', content: initialMessage },
      assistantMessage,
    ];

    this.messages.set(messages);

    const chat = await firstValueFrom(
      this.http.post<AgentChat>(`${environment.baseURL}/chats/new`, {
        chat: {
          agentId: agentId,
          models: [agentId],
          messages,
        },
      })
    );

    const completion = await firstValueFrom(
      this.http.post<{ choices: { message: Message }[] }>(
        `https://gpt.sdi.es/api/chat/completions`,
        {
          id: assistantMessage.id,
          chat_id: chat.id,
          model: agentId,
          messages,
          stream: false,
        }
      )
    );

    Object.assign(assistantMessage, completion.choices[0].message);

    await this.completed(
      chat.id,
      agentId,
      assistantMessage.id!,
      this.messages()
    );

    await this.updateChatById(chat.id, {
      history: this.history(),
      messages: this.messages(),
      models: [agentId],
    });

    this.sending.set(false);
    return { ...chat, chat: { ...chat.chat, messages: this.messages() } };
  }

  async completed(
    chatId: string,
    model: string,
    assistantMessageId: string,
    messages: Array<Message>
  ) {
    return firstValueFrom(
      this.http.post(`https://gpt.sdi.es/api/chat/completed`, {
        id: assistantMessageId,
        chat_id: chatId,
        messages,
        model,
        session_id: null,
      })
    ).catch(() => null);
  }

  /** Retrieves an existing chat from the backend */
  override find(chatId: string): Observable<AgentChat> {
    return this.http.get<AgentChat>(`${environment.baseURL}/chats/${chatId}`);
  }

  /**
   * Sends a message to an existing chat and persists the assistant's reply.
   * @param agentId Identifier used as model name
   * @param chatId Existing chat ID to append to
   * @param content User message content
   */
  async sendMessage(
    agentId: string,
    chatId: string,
    content: string
  ): Promise<Message> {
    // 1. Prepare user message
    const userMessageId = uuidv4();
    const userMessage: Message = {
      id: userMessageId,
      parentId: this.messages()[this.messages().length - 1]?.id ?? null,
      role: 'user',
      content,
      timestamp: Math.floor(Date.now() / 1000),
    };
    this.messages.update((messages) => [...messages, userMessage]);

    const sessionId = uuidv4();

    // 2. Call completions with streaming
    const completionReq = {
      model: agentId,
      chat_id: chatId,
      stream: true,
      messages: this.messages().map((m) => ({
        role: m.role,
        content: m.content,
      })),
      session_id: sessionId,
    };

    const response = await fetch(`https://gpt.sdi.es/api/chat/completions`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(completionReq),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Completions failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let text = '';
    let assistantId: string | undefined;
    let partial = '';
    let done = false;

    this.streaming.set(true);
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
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            if (delta?.content) {
              text += delta.content;
              this.stream.set(text);
            }
            assistantId = assistantId ?? parsed.id;
            // sessionId = sessionId ?? parsed.session_id;
          } catch (e) {
            console.error(e);
            /* ignore parse errors */
          }
        }
      }
    }
    reader.releaseLock();

    this.stream.set(null);
    this.streaming.set(false);

    const assistantMessage: Message = {
      id: assistantId,
      parentId: userMessageId,
      role: 'assistant',
      content: text,
      timestamp: Math.floor(Date.now() / 1000),
    };

    this.messages.update((messages) => [...messages, assistantMessage]);

    // 3. Call completed to persist conversation
    const completedReq = {
      model: agentId,
      chat_id: chatId,
      session_id: sessionId || '',
      id: assistantId,
      messages: this.messages(),
    };
    await firstValueFrom(
      this.http.post(`https://gpt.sdi.es/api/chat/completed`, completedReq)
    );

    await this.updateChatById(chatId, {
      history: this.history(),
      messages: this.messages(),
      models: [agentId],
    });

    return assistantMessage;
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
      const result = await firstValueFrom(
        this.http.post(`${environment.baseURL}/${this.path}/${chatId}`, payload)
      );
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
    throw new Error('not developed');

    // try {
    //   const currentHistory = this.chatHistory.value;
    //   const currentMessages = this.createMessagesList(
    //     currentHistory,
    //     currentHistory.currentId
    //   );

    //   await this.updateChatById(chatId, {
    //     models: this.selectedModels(),
    //     messages: currentMessages,
    //     history: currentHistory,
    //     ...updates,
    //   });
    // } catch (error) {
    //   // No lanzar error para no interrumpir la UX, solo loggear
    //   console.error('Quick update failed:', error);
    // }
  }

  /** Deletes a chat by identifier */
  deleteChat(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.baseURL}/chats/${id}`);
  }
}
