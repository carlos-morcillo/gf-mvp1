import { HttpClient } from '@angular/common/http';
import { Injectable, WritableSignal, signal, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
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

  private http = inject(HttpClient);

  override list(request: Partial<PagedDataRequestParam> = {}): Observable<AgentChat[]> {
    return this.http.get<AgentChat[]>(`${environment.baseURL}/${this.path}/`);
  }

  /** Returns current message history */
  getMessages(_agentId: string): Observable<ChatMessage[]> {
    return of(this.messages());
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
        `${environment.openWebUiUrl}/api/chat/completions`,
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
}
