import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { MOMENT } from 'angular-calendar';
import hoursToMinutes from 'date-fns/esm/fp/hoursToMinutes/index.js';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss'],
})
export class ScheduleComponent implements OnInit {
  public schedule: string;
  public showHeader = false;
  public user;
  // nombre de sucursal
  public branchId;
  // public nameBranch = '';
  public tunoCorre = 0;

  public today;
  public contador = null;

  public dataBranch: any[] = [];
  constructor(
    public platform: Platform, 
    public router: Router, 
    public service: ServiceGeneralService) { }

  ngOnInit() {

    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log('user', this.user);
    // obtener el nombre de sucursal
    this.branchId = this.user.branchId;
    // this.getBranch();
    if (this.platform.is('android')) {
      this.showHeader = false;
    } else if (this.platform.is('ios')) {
      this.showHeader = true;
    }
    //this.startTimer();
    this.validaTurno();
  }

  selecSchedule() {
    if (this.schedule === '1') {
      this.router.navigate(['/supervisor/control-matutino/tarea/1']);
      // this.router.navigateByUrl('supervisor/control-matutino');
    } else if (this.schedule === '2') {
      this.router.navigate(['/supervisor/control-vespertino/tarea/1']);
      // this.router.navigateByUrl('supervisor/control-vespertino');
    }
  }

    //FUNCIONES DEL TIMER DE VOLADO DE EFECTIVO
    startTimer() {
      this.stopTimer();
      this.contador = setInterval((n) => { 
        this.validaTurno();
        console.log('muestra timer'); }, 20000);
    }
    
    stopTimer() {
      
        clearInterval(this.contador);
      
    }

  async validaTurno() {
    // const timeT1ini = '07:00:00';
    // const timeT1fin = '17:00:00';
    // const timeT2ini = '17:00:01';
    // const timeT2fin = '23:59:59';
    // const timeT2ini1 = '0:00:00';
    // const timeT2fin2 = '3:00:00';
    this.today = new Date();
    var time = this.today.getHours();
    this.tunoCorre = 0;
    if (this.tunoCorre == 0) {
      console.log('Hora:', time);
      
       
      if ( time >= 3 && time < 17) {
        this.tunoCorre = 1;
        console.log('Turno', this.tunoCorre);
      }
      

      if (time > 16 && time <= 23) {
          this.tunoCorre = 2;
          console.log('Turno', this.tunoCorre);
        }
        if(time >= 0 && time < 3) {
          this.tunoCorre = 2;
          console.log('Turno', this.tunoCorre);
        }
      
      if(this.tunoCorre == 0){
       
        this.stopTimer()
        this.router.navigateByUrl('login');
        localStorage.removeItem('userData');

      }
      
    }

    
  }
  // get  name sucursal
  // getBranch() {
  //   let branchIdNumber = 0;
  //   branchIdNumber = Number(this.branchId);
  //   console.log('branchIdNumber', branchIdNumber);
  //   this.service.serviceGeneralGet('StockChicken/Admin/All-Branch').subscribe(resp => {
  //     if (resp.success) {
  //       this.dataBranch = resp.result;
  //       console.log('get branch', this.dataBranch);
  //       this.dataBranch.forEach(element => {
  //         if (element.branchId === branchIdNumber) {
  //           this.nameBranch = element.branchName;
  //           this.nameBranch = this.nameBranch.toUpperCase();
  //           console.log('nombre', this.nameBranch);
  //         }
  //       });
  //     }
  //   });
  // }
}

