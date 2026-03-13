import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaseEmAnalise } from './fase-em-analise';

describe('FaseEmAnalise', () => {
  let component: FaseEmAnalise;
  let fixture: ComponentFixture<FaseEmAnalise>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaseEmAnalise]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaseEmAnalise);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
