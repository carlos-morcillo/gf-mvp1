import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject, WritableSignal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AgentChatService } from './agent-chat.service';
import { ChatMessage } from './chat-message';

/**
 * Chat component that mimics the ChatGPT interface.
 * Messages are displayed above and the input stays fixed at the bottom.
 */
@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslocoModule],
  templateUrl: './agent-chat.component.html'
})
export class AgentChatComponent {
  private chatSvc = inject(AgentChatService);
  transloco = inject(TranslocoService);

  /** Skills available for the agent */
  skills = [
    'VISION',
    'FILE_UPLOAD',
    'WEB_SEARCH',
    'IMAGE_GENERATION',
    'CODE_INTERPRETER',
    'CITATIONS',
    'USAGE'
  ];

  /** Current list of chat messages */
  messages: WritableSignal<ChatMessage[]> = this.chatSvc.messages;
  sending = this.chatSvc.sending;

  /** Input model */
  inputValue = '';

  @ViewChild('scroll') scrollContainer?: ElementRef<HTMLDivElement>;

  constructor() {
    // Scroll to bottom whenever messages change
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
    this.chatSvc.sendMessage('default', content).subscribe();
    this.inputValue = '';
  }

  private scrollToBottom(): void {
    const el = this.scrollContainer?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
