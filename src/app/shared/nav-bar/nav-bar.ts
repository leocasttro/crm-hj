import { faBell, faMagnifyingGlass, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-nav-bar',
  imports: [FontAwesomeModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss'
})
export class NavBar {
  faSearch = faMagnifyingGlass;
  faNotification = faBell;
  faPlus = faPlus;
}
