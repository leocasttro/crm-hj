import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaseCriado } from './fase-criado';

describe('FaseCriado', () => {
  let component: FaseCriado;
  let fixture: ComponentFixture<FaseCriado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaseCriado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaseCriado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
