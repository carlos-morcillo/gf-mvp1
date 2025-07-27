import { firstValueFrom } from "rxjs";
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, resource } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PinnedChat } from './pinned-chat';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);

  private pinnedChatsResource = resource({
    loader: () => firstValueFrom(this.http.get<PinnedChat[]>(`${environment.baseURL}/chats/pinned`)),
  });

  readonly pinnedChats = this.pinnedChatsResource.value;
  readonly isLoadingPinned = this.pinnedChatsResource.isLoading;
}
