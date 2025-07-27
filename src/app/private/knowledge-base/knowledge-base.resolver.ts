import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { KnowledgeBase } from '../knowledge-list/knowledge-base.model';
import { KnowledgeBaseService } from './knowledge-base.service';

/** Resolver to fetch an agent before activating the edition route. */
@Injectable({ providedIn: 'root' })
export class KnowledgeBaseResolver implements Resolve<KnowledgeBase | null> {
  constructor(private knoledgeBaseSvc: KnowledgeBaseService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<KnowledgeBase | null> {
    const id = route.paramMap.get('knowledgeId');
    return id && id !== 'add' ? this.knoledgeBaseSvc.find(id) : of(null);
  }
}
