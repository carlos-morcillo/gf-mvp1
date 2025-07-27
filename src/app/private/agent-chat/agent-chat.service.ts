import { Injectable, WritableSignal, signal } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../../environments/environment';
import { CollectionService } from '../../shared/services';
import { PagedDataRequestParam } from '../../shared/types/paged-data-request-param';
import { AgentChat, Message } from './agent-chat.model';

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

  /** Flag indicating that a request is in progress */
  readonly sending = signal(false);

  override list(
    request: Partial<PagedDataRequestParam> = {}
  ): Observable<AgentChat[]> {
    return this.http.get<AgentChat[]>(`${environment.baseURL}/${this.path}/`);
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
    const messages: Message[] = [
      { role: 'user', content: initialMessage },
      { role: 'assistant', content: '' },
    ];

    const chat = await firstValueFrom(
      this.http.post<AgentChat>(`${environment.baseURL}/chats/new`, {
        chat: {
          agentId: agentId,
          models: [agentId],
          messages: [
            { role: 'user', content: initialMessage },
            { role: 'assistant', content: '' },
          ],
        },
      })
    );

    this.messages.set(messages);

    const completion = await firstValueFrom(
      this.http.post<{ choices: { message: Message }[] }>(
        `https://gpt.sdi.es/api/chat/completions`,
        { id: messages.at(-1)?.id, model: agentId, messages, stream: false }
      )
    );

    const assistantMessage = completion.choices[0].message;
    this.messages.update((m) => [...m, assistantMessage]);
    await this.completed(
      chat.id,
      agentId,
      assistantMessage.id!,
      this.messages()
    );

    this.sending.set(false);
    return { ...chat, chat: { ...chat.chat, messages: this.messages() } };
  }

  async completed(
    chatId: string,
    model: string,
    parentId: string,
    messages: Array<Message>
  ) {
    return firstValueFrom(
      this.http.post(`https://gpt.sdi.es/api/chat/completed`, {
        id: parentId,
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
   * Sends a user message to an existing chat and persists the assistant's reply.
   * Uses HttpClient without streaming support (stream: false).
   */
  async sendMessage(
    agentId: string,
    chatId: string,
    content: string
  ): Promise<Message> {
    this.sending.set(true);
    // Generate user message
    const userMsgId = uuidv4();
    const userMsg: Message = {
      id: userMsgId,
      parentId: this.messages()[this.messages().length - 1]?.id ?? null,
      role: 'user',
      content,
      timestamp: Math.floor(Date.now() / 1000),
    };
    this.messages.update((messages) => [...messages, userMsg]);

    // Call completions endpoint without streaming
    const completionPayload = {
      model: agentId,
      chat_id: chatId,
      stream: false,
      messages: this.messages().map((m) => ({
        role: m.role,
        content: m.content,
      })),
    };

    const completionResp: any = await firstValueFrom(
      this.http.post(
        `https://gpt.sdi.es/api/chat/completions`,
        completionPayload
      )
    );

    const assistantMessage = completionResp.choices[0].message;
    const assistantId = assistantMessage.id ?? uuidv4();

    // Build assistant message object
    const assistantMsg: Message = {
      id: assistantId,
      parentId: userMsgId,
      role: 'assistant',
      content: assistantMessage.content,
      timestamp: Math.floor(Date.now() / 1000),
    };
    this.messages.update((messages) => [...messages, assistantMsg]);

    // Call completed endpoint to persist
    const completedPayload = {
      model: agentId,
      chat_id: chatId,
      session_id: '', // No streaming => session_id may not be provided
      id: assistantId,
      messages: this.messages(),
    };

    await firstValueFrom(
      this.http.post(`https://gpt.sdi.es/api/chat/completed`, completedPayload)
    );
    this.sending.set(false);
    return assistantMsg;
  }

  /**
   * Sends a message to an existing chat and persists the assistant's reply.
   * @param agentId Identifier used as model name
   * @param chatId Existing chat ID to append to
   * @param content User message content
   */
  async sendMessage2(agentId: string, chatId: string, content: string) {
    // 1. Prepare user message
    const userMessageId = uuidv4();
    const lastMessage = this.messages()[this.messages().length - 1]!;
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
      id: lastMessage.id,
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

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;
      if (value) {
        partial += decoder.decode(value, { stream: true });
        console.log(partial, streamDone);

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
    debugger;
    if (!assistantId) assistantId = uuidv4();

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
      id: lastMessage.id,
      model: agentId,
      chat_id: chatId,
      session_id: sessionId || '',
      //   id: assistantId,
      messages: this.messages(),
    };
    const result = await firstValueFrom(
      this.http.post(`https://gpt.sdi.es/api/chat/completed`, completedReq)
    );

    return result;
  }

  /**
   * Sends a user message to the backend and updates the conversation.
   * The agent identifier is used as the model name when calling Open WebUI.
   */
  //   sendMessage(
  //     agentId: string,
  //     chatId: string,
  //     content: string
  //   ): Observable<Message> {
  //     this.sending.set(true);
  //     const parentId = this.messages().at(-1)!.id;
  //     const body: {
  //       id: string | undefined;
  //       model: string;
  //       messages: Array<Message>;
  //       stream: boolean;
  //     } = {
  //       id: parentId,
  //       model: agentId,
  //       messages: [...this.messages(), { role: 'user', content }],
  //       stream: false,
  //     };

  //     return this.http
  //       .post<{ choices: { message: Message }[] }>(
  //         `https://gpt.sdi.es/api/chat/completions`,
  //         body
  //       )
  //       .pipe(
  //         map((res) => res.choices[0].message),
  //         tap((msg) => {
  //           this.messages.update((m) => [...m, { role: 'user', content }, msg]);
  //           this.sending.set(false);
  //         }),
  //         switchMap((message) =>
  //           from(this.completed(chatId, agentId, parentId!, body.messages)).pipe(
  //             map((result) => {
  //               console.log('Completed', result);
  //               return message;
  //             })
  //           )
  //         ),
  //         catchError((err) => {
  //           this.sending.set(false);
  //           throw err;
  //         })
  //       );
  //   }

  /** Deletes a chat by identifier */
  deleteChat(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.baseURL}/chats/${id}`);
  }
}
