import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Agent } from '../agent-list/agent';
import { AgentsService } from '../agent-list/agents.service';

/** Resolver to fetch an agent before activating the edition route. */
@Injectable({ providedIn: 'root' })
export class AgentResolver implements Resolve<Agent | null> {
  constructor(private agentsSvc: AgentsService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Agent | null> {
    const id = route.paramMap.get('agentId') || route.paramMap.get('id');
    return id ? this.agentsSvc.getAgent(id) : of(null);
  }
}
