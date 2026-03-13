import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaseRetorno } from './fase-retorno';

describe('FaseRetorno', () => {
  let component: FaseRetorno;
  let fixture: ComponentFixture<FaseRetorno>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaseRetorno]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaseRetorno);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
