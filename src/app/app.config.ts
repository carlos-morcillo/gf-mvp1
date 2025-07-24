import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideTransloco, provideTranslocoLoader } from '@jsverse/transloco';
import { TableModule } from 'ng-hub-ui-table';
import { routes } from './app.routes';
import { tokenInterceptor } from './auth/token.interceptor';
import { TranslocoHttpLoader } from './shared/services/transloco-http.loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    provideTransloco({
      config: {
        availableLangs: ['en', 'es'],
        defaultLang: 'es',
        reRenderOnLangChange: true,
        prodMode: true,
      },
    }),
    provideTranslocoLoader(TranslocoHttpLoader),
    importProvidersFrom(NoopAnimationsModule, TableModule.forRoot()),
  ],
};
