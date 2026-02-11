import { Component } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBell,
  faMagnifyingGlass,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { UiActionService } from '../services/ui-action.service';
import { NotificationsComponent } from "../component/notifications/notifications-component";

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, NotificationsComponent], // ✅ IMPORTANTE
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss',
})
export class NavBar {
  faSearch = faMagnifyingGlass;
  faNotification = faBell;
  faPlus = faPlus;

  pageTitle = '';
  pageSubtitle = '';
  actionLabel = '';
  currentAction = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private uiAction: UiActionService
  ) {
    this.listenToRouteChanges();
  }

  private listenToRouteChanges(): void {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        const route = this.getDeepestChild(this.route);

        const title = route.snapshot.title as string;
        const data = route.snapshot.data;

        if (title) {
          const [main, sub] = title.split('|');
          this.pageTitle = main;
          this.pageSubtitle = sub || '';
        }

        this.actionLabel = data?.['actionLabel'] || '';
        this.currentAction = data?.['action'] || '';
      });
  }

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  emitAction(): void {
    if (this.currentAction) {
      this.uiAction.emit(this.currentAction as any);
    }
  }
}
