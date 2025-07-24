import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideTransloco } from '@jsverse/transloco';
import { TableModule } from 'ng-hub-ui-table';
import { routes } from './app.routes';
import { tokenInterceptor } from './auth/token.interceptor';

// @Injectable({ providedIn: 'root' })
// export class TranslocoHttpLoader implements TranslocoLoader {
//   private http = inject(HttpClient);

//   getTranslation(lang: string) {
//     return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
//   }
// }

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
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: true,
      },
    }),
    importProvidersFrom(NoopAnimationsModule, TableModule.forRoot()),
  ],
};
