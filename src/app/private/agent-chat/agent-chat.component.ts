import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-agent-chat',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule],
  templateUrl: './agent-chat.component.html',
})
export class AgentChatComponent {}
