import { Injectable, WritableSignal, signal } from '@angular/core';
import { Observable, firstValueFrom, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CollectionService } from '../../shared/services';
import { PagedDataRequestParam } from '../../shared/types/paged-data-request-param';
import { AgentChat } from './agent-chat.model';
import { ChatMessage } from './chat-message';

@Injectable({ providedIn: 'root' })
export class AgentChatService extends CollectionService<AgentChat> {
  protected override path = 'chats';
  /** In-memory message history */
  readonly messages: WritableSignal<ChatMessage[]> = signal([]);

  /** Flag indicating that a request is in progress */
  readonly sending = signal(false);

  override list(
    request: Partial<PagedDataRequestParam> = {}
  ): Observable<AgentChat[]> {
    return this.http.get<AgentChat[]>(`${environment.baseURL}/${this.path}/`);
  }

  /** Returns current message history */
  getMessages(_agentId: string): Observable<ChatMessage[]> {
    return of(this.messages());
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
    const messages: ChatMessage[] = [
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
      this.http.post<{ choices: { message: ChatMessage }[] }>(
        `${environment.baseURL}/chat/completions`,
        { model: agentId, messages }
      )
    );

    const assistantMessage = completion.choices[0].message;
    this.messages.update((m) => [m[0], assistantMessage]);
    await firstValueFrom(
      this.http.post(`${environment.baseURL}/chat/completed`, {
        chat_id: chat.id,
      })
    ).catch(() => null);

    this.sending.set(false);
    return { ...chat, messages: this.messages() };
  }

  /** Retrieves an existing chat from the backend */
  override find(chatId: string): Observable<AgentChat> {
    return this.http.get<AgentChat>(`${environment.baseURL}/chats/${chatId}`);
  }

  /**
   * Sends a user message to the backend and updates the conversation.
   * The agent identifier is used as the model name when calling Open WebUI.
   */
  sendMessage(agentId: string, content: string): Observable<ChatMessage> {
    this.sending.set(true);
    const body = {
      model: agentId,
      messages: [...this.messages(), { role: 'user', content }],
    };

    return this.http
      .post<{ choices: { message: ChatMessage }[] }>(
        `${environment.baseURL}/chat/completions`,
        body
      )
      .pipe(
        map((res) => res.choices[0].message),
        tap((msg) => {
          this.messages.update((m) => [...m, { role: 'user', content }, msg]);
          this.sending.set(false);
        }),
        catchError((err) => {
          this.sending.set(false);
          throw err;
        })
      );
  }

  /** Deletes a chat by identifier */
  deleteChat(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.baseURL}/chats/${id}`);
  }
}
