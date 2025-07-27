import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AvatarComponent } from 'ng-hub-ui-avatar';
import { AuthService } from '../../../auth/auth.service';
import { LANGUAGES } from '../../../shared/constants/languages';
import { ChatService } from '../chat.service';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  isActive?: boolean;
  isCollapsible?: boolean;
  children?: MenuItem[];
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'home', label: 'sidebar.home', icon: 'house', route: '/private/home', isActive: true },
  { id: 'agents', label: 'sidebar.myAgents', icon: 'person', isCollapsible: true, children: [] },
  { id: 'chats', label: 'sidebar.chats', icon: 'chat', isCollapsible: true, children: [] },
  { id: 'marketplace', label: 'sidebar.marketplace', icon: 'cart', route: '/marketplace' },
  { id: 'evaluation', label: 'sidebar.evaluation', icon: 'clock', route: '/evaluation' },
  { id: 'training', label: 'sidebar.training', icon: 'mortarboard', route: '/training' },
  { id: 'gamification', label: 'sidebar.gamification', icon: 'trophy', route: '/gamification' },
  { id: 'settings', label: 'sidebar.settings', icon: 'gear', route: '/settings' },
  { id: 'help', label: 'sidebar.help', icon: 'question-circle', route: '/help' },
];

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslocoModule, AvatarComponent],
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.scss'],
})
export class AsideComponent {
  @Output() navigate = new EventEmitter<void>();

  auth = inject(AuthService);
  transloco = inject(TranslocoService);
  chatSvc = inject(ChatService);

  languages = LANGUAGES;
  currentLang = signal(localStorage.getItem('language') || 'es');

  menuItems = MENU_ITEMS;

  agentsCollapsed = signal(true);
  chatsCollapsed = signal(true);

  pinnedChats = this.chatSvc.pinnedChats;

  changeLanguage(lang: string) {
    this.currentLang.set(lang);
    this.transloco.setActiveLang(lang);
    localStorage.setItem('language', lang);
  }

  toggleAgentsCollapse() {
    this.agentsCollapsed.update((v) => !v);
  }

  toggleChatsCollapse() {
    this.chatsCollapsed.update((v) => !v);
  }

  logout() {
    this.auth.logout();
  }

  currentUser = this.auth.user;
}
