import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaseMarcacaoCirurgia } from './fase-marcacao-cirurgia';

describe('FaseMarcacaoCirurgia', () => {
  let component: FaseMarcacaoCirurgia;
  let fixture: ComponentFixture<FaseMarcacaoCirurgia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaseMarcacaoCirurgia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaseMarcacaoCirurgia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
