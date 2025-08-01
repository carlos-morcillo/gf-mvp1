import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  provideTransloco,
  translocoConfig,
  TranslocoService,
} from '@jsverse/transloco';
import { TableModule } from 'ng-hub-ui-table';
import { ToastrModule } from 'ngx-toastr';
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
        availableLangs: ['es', 'ca', 'eu', 'gl', 'ast', 'oc', 'en'],
        defaultLang: 'es',
        fallbackLang: 'es',
        reRenderOnLangChange: true,
        prodMode: environment.production,
      }),
      loader: TranslocoHttpLoader,
    }),
    importProvidersFrom(
      NoopAnimationsModule,
      TableModule.forRoot(),
      ToastrModule.forRoot()
    ),
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [TranslocoService],
      useFactory: () => preloadTranslation,
    },
  ],
};

export function preloadTranslation(translocoSvc: TranslocoService) {
  return function () {
    return null;
  };
}
