import {
  Component,
  EventEmitter,
  Output,
  afterNextRender,
  inject,
  signal,
  OnDestroy,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import * as bootstrap from 'bootstrap';

import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AvatarComponent } from 'ng-hub-ui-avatar';
import { AuthService } from '../../../auth/auth.service';
import { ChatService } from '../../../chat/chat.service';
import { LANGUAGES } from '../../../shared/constants/languages';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  isCollapsible?: boolean;
  children?: MenuItem[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'home',
    label: 'ASIDE.LABELS.HOME',
    icon: 'house',
    route: '/private/home',
  },
  {
    id: 'intranet',
    label: 'ASIDE.LABELS.INTRANET',
    icon: 'building',
    route: '/private/intranet',
  },
  {
    id: 'agents',
    label: 'ASIDE.LABELS.MY_AGENTS',
    icon: 'person',
    route: '/private/agents',
  },
  {
    id: 'chats',
    label: 'ASIDE.LABELS.CHATS',
    icon: 'chat',
    isCollapsible: true,
    children: [],
  },
  {
    id: 'marketplace',
    label: 'ASIDE.LABELS.MARKETPLACE',
    icon: 'cart',
    route: '/marketplace',
  },
  {
    id: 'evaluation',
    label: 'ASIDE.LABELS.EVALUATION',
    icon: 'easel',
    route: '/evaluation',
  },
  {
    id: 'training',
    label: 'ASIDE.LABELS.TRAINING',
    icon: 'mortarboard',
    route: '/training',
  },
  {
    id: 'gamification',
    label: 'ASIDE.LABELS.GAMIFICATION',
    icon: 'trophy',
    route: '/gamification',
  },
  {
    id: 'settings',
    label: 'ASIDE.LABELS.SETTINGS',
    icon: 'gear',
    route: '/settings',
  },
  {
    id: 'help',
    label: 'ASIDE.LABELS.HELP',
    icon: 'question-circle',
    route: '/help',
  },
];

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslocoModule, AvatarComponent],
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.scss'],
})
export class AsideComponent implements OnDestroy {
  @Output() navigate = new EventEmitter<void>();

  auth = inject(AuthService);
  transloco = inject(TranslocoService);
  chatSvc = inject(ChatService);

  languages = LANGUAGES;
  currentLang = signal(localStorage.getItem('language') || 'es');

  menuItems = MENU_ITEMS;

  chatsCollapsed = signal(true);

  pinnedChats = this.chatSvc.pinnedChats;

  private userDropdown: any;
  private languageDropdown: any;

  constructor() {
    afterNextRender(() => {
      const userEl = document.getElementById('userDropdown');
      if (userEl) {
        this.userDropdown = new bootstrap.Dropdown(userEl, {
          autoClose: 'outside',
          boundary: 'viewport',
          offset: [0, 8],
          popperConfig: {
            strategy: 'fixed',
            placement: 'top-end',
          },
        });
      }

      const langEl = document.getElementById('languageDropdown');
      if (langEl) {
        this.languageDropdown = new bootstrap.Dropdown(langEl, {
          autoClose: true,
          boundary: 'viewport',
          popperConfig: {
            strategy: 'fixed',
            placement: 'right-start',
            modifiers: [
              {
                name: 'flip',
                options: { fallbackPlacements: [] },
              },
            ],
          },
        });

        langEl.addEventListener('click', (ev) => {
          ev.stopPropagation();
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.userDropdown?.dispose();
    this.languageDropdown?.dispose();
  }

  changeLanguage(lang: string) {
    this.currentLang.set(lang);
    this.transloco.setActiveLang(lang);
    localStorage.setItem('language', lang);
  }

  toggleChatsCollapse() {
    this.chatsCollapsed.update((v) => !v);
  }

  logout() {
    this.auth.logout();
  }

  currentUser = this.auth.user;
}
