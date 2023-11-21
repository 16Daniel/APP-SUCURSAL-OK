import { PopoverController, NavParams } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit {

  constructor(private popoverCtrl: PopoverController, public router: Router,
  ) { }

  ngOnInit() { }
  logout() {
    console.log('cerrar session');
    this.popoverCtrl.dismiss();
    this.router.navigateByUrl('login');
    localStorage.removeItem('userData');
    
  }
}
