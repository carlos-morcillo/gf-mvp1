import {
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  afterNextRender,
  inject,
  signal,
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
  disabled?: boolean;
  target?: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'home',
    label: 'ASIDE.LABELS.HOME',
    icon: 'house',
    route: '/private/home',
    disabled: false,
  },
  {
    id: 'intranet',
    label: 'ASIDE.LABELS.INTRANET',
    icon: 'building',
    route: '/private/intranet',
    disabled: false,
  },
  {
    id: 'agents',
    label: 'ASIDE.LABELS.MY_AGENTS',
    icon: 'person',
    route: '/private/agents',
    disabled: false,
  },
  {
    id: 'chats',
    label: 'ASIDE.LABELS.CHATS',
    icon: 'chat',
    isCollapsible: true,
    children: [],
  },
  {
    id: 'knowledge-bases',
    label: 'SIDEBAR.MENU.KNOWLEDGE',
    route: '/private/knowledge-bases',

    icon: 'book',
    isCollapsible: false,
    children: [],
  },
  {
    id: 'marketplace',
    label: 'ASIDE.LABELS.MARKETPLACE',
    icon: 'cart',
    route: '/private/marketplace',
  },
  //   {
  //     id: 'evaluation',
  //     label: 'ASIDE.LABELS.EVALUATION',
  //     icon: 'easel',
  //     route:
  //       'https://forms.office.com/Pages/ResponsePage.aspx?id=Hiqttwiab0u1GUVodBQvvZYuSP2sOIFNoxLuOyYj9KdURVlETUtFRFhDTlJMWE9NSVk0ODVZMkpHUS4u',
  //
  //     disabled: false,
  //   },
  {
    id: 'training',
    label: 'ASIDE.LABELS.TRAINING',
    icon: 'mortarboard',
    route: '/private/training',
  },
  //   {
  //     id: 'gamification',
  //     label: 'ASIDE.LABELS.GAMIFICATION',
  //     icon: 'trophy',
  //     route: '/gamification',
  //     disabled: true,
  //   },
  //   {
  //     id: 'settings',
  //     label: 'ASIDE.LABELS.SETTINGS',
  //     icon: 'gear',
  //     route: '/settings',
  //     disabled: true,
  //   },
  //   {
  //     id: 'help',
  //     label: 'ASIDE.LABELS.HELP',
  //     icon: 'question-circle',
  //     route: '/help',
  //     disabled: true,
  //   },
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
  loadingPins = signal<Set<string>>(new Set());

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
          offset: [0, 4],
          popperConfig: {
            strategy: 'fixed',
            placement: 'top-start',
            modifiers: [
              {
                name: 'flip',
                options: { fallbackPlacements: ['bottom-start', 'top-end'] },
              },
            ],
          },
        });

        langEl.addEventListener('click', (ev) => {
          ev.stopPropagation();
        });

        langEl.addEventListener('shown.bs.dropdown', () => {
          const layout = document.querySelector('.private-layout');
          layout?.classList.add('overflow-visible');
        });

        langEl.addEventListener('hidden.bs.dropdown', () => {
          const layout = document.querySelector('.private-layout');
          layout?.classList.remove('overflow-visible');
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

  async togglePin(chatId: string): Promise<void> {
    this.loadingPins.update((set) => new Set(set).add(chatId));
    try {
      await this.chatSvc.toggleChatPin(chatId);
    } finally {
      this.loadingPins.update((set) => {
        const newSet = new Set(set);
        newSet.delete(chatId);
        return newSet;
      });
    }
  }

  currentUser = this.auth.user;
}
