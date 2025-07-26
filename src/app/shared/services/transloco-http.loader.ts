import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private http = inject(HttpClient);

  /**
   * Retrieves a JSON file containing translations based on the specified language.
   *
   * @param {string} lang - a string that represents the language code used to fetch the translation
   * data from the corresponding JSON file located in the `/assets/i18n/` directory.
   *
   * @returns an HTTP request to fetch a JSON file containing translations for the specified language.
   */
  getTranslation(lang: string) {
    return this.http.get<Translation>(`/i18n/${lang}.json`);
  }
}
