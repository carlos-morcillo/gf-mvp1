import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

// Build-time generated URLs for all translation files
const translationUrls = (import.meta as any).glob('../../../assets/i18n/*/*.json', {
  as: 'url',
  eager: true,
});

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  /**
   * Loads and merges all JSON translation files for the requested language.
   */
  getTranslation(lang: string): Observable<Translation> {
    const urls = Object.entries(translationUrls)
      .filter(([path]) => path.includes(`/assets/i18n/${lang}/`))
      .map(([, url]) => this.http.get<Translation>(url as string));

    return forkJoin(urls).pipe(
      map((parts) => parts.reduce((acc, curr) => ({ ...acc, ...curr }), {}))
    );
  }
}
