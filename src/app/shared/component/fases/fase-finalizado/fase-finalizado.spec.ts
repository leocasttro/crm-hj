import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaseFinalizado } from './fase-finalizado';

describe('FaseFinalizado', () => {
  let component: FaseFinalizado;
  let fixture: ComponentFixture<FaseFinalizado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaseFinalizado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaseFinalizado);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
