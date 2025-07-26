import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AgentChat } from './agent-chat.model';
import { AgentChatService } from './agent-chat.service';

/** Resolver to fetch an agent before activating the edition route. */
@Injectable({ providedIn: 'root' })
export class ChatResolver implements Resolve<AgentChat | null> {
  constructor(private chatsSvc: AgentChatService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<AgentChat | null> {
    const id = route.paramMap.get('chatId');
    return id && id !== 'add' ? this.chatsSvc.find(id) : of(null);
  }
}
