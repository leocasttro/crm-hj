import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaseFaturamento } from './fase-faturamento';

describe('FaseFaturamento', () => {
  let component: FaseFaturamento;
  let fixture: ComponentFixture<FaseFaturamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaseFaturamento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaseFaturamento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
