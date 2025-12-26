import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type UiAction =
  | 'novo-paciente'
  | 'nova-cirurgia';

@Injectable({
  providedIn: 'root',
})
export class UiActionService {

  private actionSubject = new Subject<UiAction>();
  action$ = this.actionSubject.asObservable();

  emit(action: UiAction): void {
    this.actionSubject.next(action);
  }
}
