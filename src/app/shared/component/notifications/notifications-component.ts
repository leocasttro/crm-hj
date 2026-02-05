import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { NotificationStore } from '../../services/notification.store';

@Component({
  selector: 'app-notifications-component',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './notifications-component.html',
  styleUrls: ['./notifications-component.scss'],
})
export class NotificationsComponent {
  store = inject(NotificationStore);
  router = inject(Router);

  faBell = faBell;
  open = signal(false);

  toggle() {
    this.open.update(v => !v);
  }

  openLink(n: any) {
    if (n.link) this.router.navigateByUrl(n.link);
    this.store.markRead(n.id);
    this.open.set(false);
  }
}
