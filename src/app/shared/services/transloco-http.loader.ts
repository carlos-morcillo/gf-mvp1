import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable } from 'rxjs';

// Build-time generated URLs for all translation files
const translationUrls = (import.meta as any).glob(
  '../../../assets/i18n/*.json',
  {
    as: 'url',
    eager: true,
  }
);

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  /**
   * Loads the JSON translation file for the requested language.
   */
  getTranslation(lang: string): Observable<Translation> {
    const url = translationUrls[`../../../assets/i18n/${lang}.json`];
    return this.http.get<Translation>(url as string);
  }
}
