import { Routes } from '@angular/router';
import { UserResolver } from '../auth/resolvers/user.resolver';
import { ChatResolver } from './agent-chat/chat.resolver';
import { AgentResolver } from './agent-edition/agent.resolver';
import { authGuard } from './auth.guard';
import { PrivateLayoutComponent } from './layout/private-layout.component';

export const PRIVATE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    component: PrivateLayoutComponent,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./home/home.component').then((c) => c.HomeComponent),
      },
      {
        path: 'profile',
        resolve: { user: UserResolver },
        loadComponent: () =>
          import('../private/user-profile/user-profile.component').then(
            (m) => m.UserProfileComponent
          ),
        canActivate: [
          () => import('../private/auth.guard').then((m) => m.authGuard),
        ],
      },
      {
        path: 'agents',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./agent-list/agent-list.component').then(
                (c) => c.AgentListComponent
              ),
          },
          {
            path: 'add',
            loadComponent: () =>
              import('./agent-edition/agent-edition.component').then(
                (c) => c.AgentEditionComponent
              ),
          },
          {
            path: ':agentId/chats',
            children: [
              //       {
              //         path: '',
              //         loadComponent: () =>
              //           import('./agent-chat/agent-chat-list.component').then(
              //             (c) => c.AgentChatListComponent
              //           ),
              //       },
              {
                path: 'add',
                loadComponent: () =>
                  import('./agent-chat/agent-chat.component').then(
                    (c) => c.AgentChatComponent
                  ),
              },
              //       {
              //         path: ':chatId',
              //         loadComponent: () =>
              //           import('./agent-chat/agent-chat.component').then(
              //             (c) => c.AgentChatComponent
              //           ),
              //       },
            ],
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./agent-edition/agent-edition.component').then(
                (c) => c.AgentEditionComponent
              ),
            resolve: { agent: AgentResolver },
          },
        ],
      },
      {
        path: 'chats',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./agent-chat/agent-chat-list.component').then(
                (c) => c.AgentChatListComponent
              ),
          },
          {
            path: 'add',
            loadComponent: () =>
              import('./agent-chat/agent-chat.component').then(
                (c) => c.AgentChatComponent
              ),
          },
          {
            path: ':chatId',
            resolve: { chat: ChatResolver },
            loadComponent: () =>
              import('./agent-chat/agent-chat.component').then(
                (c) => c.AgentChatComponent
              ),
          },
        ],
      },
      {
        path: 'training',
        loadComponent: () =>
          import('./training/training.component').then(
            (c) => c.TrainingComponent
          ),
      },
      {
        path: 'evaluation',
        loadComponent: () =>
          import('./evaluation/evaluation.component').then(
            (c) => c.EvaluationComponent
          ),
      },
      {
        path: 'chats',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./agent-chat/agent-chat-list.component').then(
                (c) => c.AgentChatListComponent
              ),
          },
          {
            path: 'add',
            loadComponent: () =>
              import('./agent-chat/agent-chat.component').then(
                (c) => c.AgentChatComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./agent-chat/agent-chat.component').then(
                (c) => c.AgentChatComponent
              ),
          },
        ],
      },
      {
        path: 'knowledge',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./knowledge-list/knowledge-list.component').then(
                (c) => c.KnowledgeListComponent
              ),
          },
          {
            path: 'create',
            loadComponent: () =>
              import('./knowledge-edition/knowledge-edition.component').then(
                (c) => c.KnowledgeEditionComponent
              ),
          },
        ],
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
];
