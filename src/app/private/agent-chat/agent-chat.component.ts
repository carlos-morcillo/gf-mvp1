import { DatePipe, JsonPipe, Location } from '@angular/common';
import {
  Component,
  ElementRef,
  ResourceRef,
  WritableSignal,
  effect,
  inject,
  model,
  resource,
  signal,
  computed,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgSelectComponent } from '@ng-select/ng-select';
import { firstValueFrom } from 'rxjs';
import { Agent } from '../agent-list/agent';
import { AgentsService } from '../agent-list/agents.service';
import { AgentChat, Message } from './agent-chat.model';
import { AgentChatService } from './agent-chat.service';
import { ChatService } from '../../chat/chat.service';

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [
    FormsModule,
    TranslocoModule,
    DatePipe,
    NgSelectComponent,
    JsonPipe,
  ],
  styleUrls: ['./agent-chat.component.scss'],
  templateUrl: './agent-chat.component.html',
  host: {
    class: 'list-page list-page--container',
  },
})
export class AgentChatComponent {
  private chatsSvc = inject(AgentChatService);
  private agentsSvc = inject(AgentsService);
  private activateRoute = inject(ActivatedRoute);
  private chatSvc = inject(ChatService);
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

  /** Pinned state and loading flag */
  pinned = computed(() => this.chatSvc.isPinned(this.chatId()));
  loadingPin = signal(false);

  /** Input model */
  currentMessage = '';

  /** Container element that holds the messages */
  readonly scrollContainer =
    viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  agents: ResourceRef<Array<Agent> | undefined> = resource({
    loader: () => firstValueFrom(this.agentsSvc.all()),
  });

  /** Agent identifier captured from the route */
  //   agentId = input<string | null>('', { alias: 'agentId' });

  agentId = signal<string | null>(null);

  agentsEffect = effect(() => {
    const agents = this.agents.value();
    if (agents?.length && !this.agentId()) {
      this.agentId.set(agents.at(0)!.id);
    }
  });

  agentIdEffect = effect(() => {
    const agentId = this.agentId();
    this.models.set(agentId ? [agentId] : []);
  });

  models = signal<Array<string>>([]);

  //   modelsEffect = effect(() => {
  //     const models = this.models();
  //     this.agentId.set(models.at(0) ?? null);
  //     if (models.length) {
  //     }
  //   });

  /** Chat identifier from the route */
  chatId = model<string | undefined | null>(null, { alias: 'chatId' });

  chat = model<AgentChat | null>(null);

  chatEffect = effect(() => {
    const chat = this.chat();
    this.chatsSvc.messages.set(chat?.chat?.messages ?? []);
    if (!chat) {
      return;
    }
    // this.agentId.set(chat.chat.agentId);
    this.models.set(chat.chat.models);
    this.agentId.set(chat.chat.models.at(0) ?? null);
  });

  constructor() {
    // Keep the latest message in view once Angular renders the DOM
    effect(() => {
      this.messages();
      queueMicrotask(() => this.scrollToBottom());
    });
  }

  ngOnInit() {
    const agentId = this.activateRoute.snapshot.paramMap.get('agentId');
    if (agentId) {
      this.agentId.set(agentId);
    }
  }

  /** Sends the current input value */
  async send() {
    const model = this.models().at(0);
    if (!model) {
      return;
    }
    const content = this.currentMessage.trim();
    if (!content) {
      return;
    }
    if (!this.chatId() || this.chatId() === 'add') {
      this.chatsSvc
        .createChatWithAgent(model, content)
        .then((chat: AgentChat) => {
          this.chatId.set(chat.id);
          this.#location.replaceState(`/private/chats/${this.chatId()}`);
        })
        .catch(() => {});
    } else {
      await this.chatsSvc.sendMessage(model, this.chatId()!, content);
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
    const el = this.scrollContainer()?.nativeElement;
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

  /** Toggle pin state for the current chat */
  async togglePin(): Promise<void> {
    const id = this.chatId();
    if (!id) return;
    this.loadingPin.set(true);
    try {
      await this.chatSvc.toggleChatPin(id);
    } finally {
      this.loadingPin.set(false);
    }
  }
}
