import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideTransloco, provideTranslocoConfig, provideTranslocoLoader, translocoConfig } from '@jsverse/transloco';
import { TableModule } from 'ng-hub-ui-table';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { tokenInterceptor } from './auth/token.interceptor';
import { TranslocoHttpLoader } from './shared/services/transloco-http.loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    provideTransloco({
      config: translocoConfig({
        availableLangs: ['es', 'ca', 'eu', 'gl', 'ast', 'oc'],
        defaultLang: 'es',
        fallbackLang: 'es',
        reRenderOnLangChange: true,
        prodMode: environment.production,
      }),
      loader: TranslocoHttpLoader,
    }),
    importProvidersFrom(NoopAnimationsModule, TableModule.forRoot()),
  ],
};
