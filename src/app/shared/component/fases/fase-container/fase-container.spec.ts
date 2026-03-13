import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaseContainer } from './fase-container';

describe('FaseContainer', () => {
  let component: FaseContainer;
  let fixture: ComponentFixture<FaseContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaseContainer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaseContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
