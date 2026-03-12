import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FasePosOperatorio } from './fase-pos-operatorio';

describe('FasePosOperatorio', () => {
  let component: FasePosOperatorio;
  let fixture: ComponentFixture<FasePosOperatorio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FasePosOperatorio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FasePosOperatorio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
