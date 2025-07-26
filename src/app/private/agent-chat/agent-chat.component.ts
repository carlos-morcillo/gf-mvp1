import {
  Component,
  ElementRef,
  ViewChild,
  WritableSignal,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AgentChat } from './agent-chat.model';
import { AgentChatService } from './agent-chat.service';
import { ChatMessage } from './chat-message';

/**
 * Chat component that mimics the ChatGPT interface.
 * Messages are displayed above and the input stays fixed at the bottom.
 */
@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslocoModule],
  templateUrl: './agent-chat.component.html',
})
export class AgentChatComponent {
  private chatsSvc = inject(AgentChatService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
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
  messages: WritableSignal<ChatMessage[]> = this.chatsSvc.messages;
  sending = this.chatsSvc.sending;

  /** Indicates that the chat history is being loaded */
  loading = signal(false);
  /** Error flag when the chat cannot be retrieved */
  error = signal(false);

  /** Input model */
  inputValue = '';

  /** Container element that holds the messages */
  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;

  /** Agent identifier captured from the route */
  agentId = model<string>('', { alias: 'agentId' });
  /** Chat identifier from the route */
  chatId = model<string | undefined | null>(null, { alias: 'id' });

  chat = input<AgentChat | null>(null);

  //   messages = resource({
  // 	params: () => ({chat: this.chat()}),
  // 	loader: async ({params: {chat}}) =>{
  // 		if(!chat) {
  // 			return null;
  // 		}
  // 		return this.chatsSvc.getMessages()
  // 	}
  //   })

  //   chatEffect = effect(() => {
  //     const chatId = this.chatId();
  //     const agentId = this.agentId();
  //     if (chatId && chatId !== 'new') {
  //       // Retrieve complete history for existing chats
  //       this.loading.set(true);
  //       this.error.set(false);
  //       this.chatSvc
  //         .find(chatId)
  //         .then((chat) => {
  //           this.messages.set(chat.messages);
  //           this.loading.set(false);
  //         })
  //         .catch(() => {
  //           this.messages.set([]);
  //           this.loading.set(false);
  //           this.error.set(true);
  //         });
  //     } else {
  //       this.messages.set([]);
  //     }
  //   });

  constructor() {
    // Keep the latest message in view once Angular renders the DOM
    effect(() => {
      this.messages();
      queueMicrotask(() => this.scrollToBottom());
    });
  }

  /** Sends the current input value */
  send(): void {
    const content = this.inputValue.trim();
    if (!content) {
      return;
    }
    if (!this.chatId() || this.chatId() === 'add') {
      this.chatsSvc
        .createChatWithAgent(this.agentId(), content)
        .then((chat: AgentChat) => {
          this.chatId.set(chat.id);
          this.router.navigate([
            '/agents',
            this.agentId(),
            'chats',
            this.chatId(),
          ]);
        })
        .catch(() => {});
    } else {
      this.chatsSvc.sendMessage(this.agentId(), content).subscribe();
    }
    this.inputValue = '';
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
}
