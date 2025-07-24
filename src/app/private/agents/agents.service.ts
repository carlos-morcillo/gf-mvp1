import { Injectable } from '@angular/core';
import { CollectionService } from '../../shared/services';
import { Agent } from './agent';

/**
 * Service to manage Agent collection interactions.
 */
@Injectable({ providedIn: 'root' })
export class AgentsService extends CollectionService<Agent> {
  /** Backend endpoint path */
  protected override path = 'agents';
}
