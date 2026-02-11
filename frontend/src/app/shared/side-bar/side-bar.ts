import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { faCalendarDays, faChartBar, faGear, faPeopleGroup, faStethoscope, faTableCellsLarge, faTableList } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-side-bar',
  imports: [RouterModule, FontAwesomeModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.scss'
})
export class SideBar {
  faStethoscope = faStethoscope;
  faTable = faTableList;
  faPeople = faPeopleGroup;
  faCalendar = faCalendarDays
  faGear = faGear;
  faChart = faChartBar
}
