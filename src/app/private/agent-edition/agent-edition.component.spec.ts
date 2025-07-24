import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentEdition } from './agent-edition';

describe('AgentEdition', () => {
  let component: AgentEdition;
  let fixture: ComponentFixture<AgentEdition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentEdition]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentEdition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
