import { DatePipe, Location } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewChild,
  WritableSignal,
  effect,
  inject,
  model,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AgentChat, Message } from './agent-chat.model';
import { AgentChatService } from './agent-chat.service';

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [FormsModule, TranslocoModule, DatePipe],
  styleUrls: ['./agent-chat.component.scss'],
  templateUrl: './agent-chat.component.html',
  host: {
    class: 'list-page list-page--container',
  },
})
export class AgentChatComponent {
  private chatsSvc = inject(AgentChatService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  #location = inject(Location);
  transloco = inject(TranslocoService);

  /** Skills available for the agent */
  skills = [
    'VISION',
    'FILE_UPLOAD',
    'WEB_SEARCH',
    'IMAGE_GENERATION',
    'CODE_INTERPRETER',
    'CITATIONS',
    'USAGE',
  ];

  /** Current list of chat messages */
  messages: WritableSignal<Message[]> = this.chatsSvc.messages;
  stream = this.chatsSvc.stream;
  streamEffect = effect(() => {
    this.stream();
    this.scrollToBottom();
  });
  streaming = this.chatsSvc.streaming;
  files: any[] = [];

  sending = this.chatsSvc.sending;

  /** Indicates that the chat history is being loaded */
  loading = signal(false);
  /** Error flag when the chat cannot be retrieved */
  error = signal(false);

  /** Input model */
  currentMessage = '';

  /** Container element that holds the messages */
  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;

  /** Agent identifier captured from the route */
  agentId = model<string>('', { alias: 'agentId' });

  models = signal<Array<string>>(this.agentId() ? [this.agentId()] : []);

  /** Chat identifier from the route */
  chatId = model<string | undefined | null>(null, { alias: 'chatId' });

  chat = model<AgentChat | null>(null);

  chatEffect = effect(() => {
    const chat = this.chat();
    this.chatsSvc.messages.set(chat?.chat?.messages ?? []);
    if (!chat) {
      return;
    }
    this.agentId.set(chat.chat.agentId);
    this.models.set([chat.chat.agentId]);
  });

  constructor() {
    // Keep the latest message in view once Angular renders the DOM
    effect(() => {
      this.messages();
      queueMicrotask(() => this.scrollToBottom());
    });
  }

  /** Sends the current input value */
  async send() {
    const content = this.currentMessage.trim();
    if (!content) {
      return;
    }
    if (!this.chatId() || this.chatId() === 'add') {
      this.chatsSvc
        .createChatWithAgent(this.agentId(), content)
        .then((chat: AgentChat) => {
          this.chatId.set(chat.id);
          this.#location.replaceState(`/private/chats/${this.chatId()}`);
        })
        .catch(() => {});
    } else {
      await this.chatsSvc.sendMessage(this.agentId(), this.chatId()!, content);
    }
    this.scrollToBottom();
    this.currentMessage = '';
  }

  /**
   * Scrolls the message container to the last message.
   * This is triggered every time the message list changes so
   * the newest interaction is always visible.
   */
  private scrollToBottom(): void {
    const el = this.scrollContainer?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
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
    this.models.set(newModels);

    if (chatId !== 'local') {
      await this.chatsSvc.quickUpdateChat(chatId, { models: newModels });
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
