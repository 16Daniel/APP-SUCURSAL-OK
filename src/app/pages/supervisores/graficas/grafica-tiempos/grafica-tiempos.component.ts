import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { DialogAddPackageComponent } from '../../dialog/dialog-add-package/dialog-add-package.component';
import { LoaderComponent } from 'src/app/pages/dialog-general/loader/loader.component'
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AlertController } from '@ionic/angular';
import { DatePipe, formatNumber } from '@angular/common';

import { ChartConfiguration } from 'chart.js';
import {HttpClient} from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-grafica-tiempos',
  templateUrl: './grafica-tiempos.component.html',
  styleUrls: ['./grafica-tiempos.component.scss'],
})
export class GraficaTiemposComponent implements OnInit {



  public today = new Date();
  public user: any;
  public idSucursal: string;
  public disabled = false;
  public createDate = '';
  public data;
  public turno;
  public DateIni;
  public DateFin;
  dateIni = new Date().toISOString();
  dateFin = new Date().toISOString();
  public dataR: RangosDataModel []= [];
  constructor(
    public router: Router,
    public modalController: ModalController,
    public routerActive: ActivatedRoute,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    public alertController: AlertController,
    public datepipe: DatePipe,

  ) { }

  generaGrafico(R0: number, R1: number,R2: number, R3: number){

    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    
    var mychart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['0-15 MINUTOS', '16-25 MINUTOS', '26-30 MINUTOS', 'DESCONEXION'],
        datasets: [{
          label: '%',
          data: [R0, R1, R2, R3],
          backgroundColor: [
            'rgb(34, 139, 34)',
            'rgb(255, 140, 0)',
            'rgb(178, 34, 34)',
            'rgb(139, 0, 139)'
          ],
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'TIEMPOS EN COCINA'
          },
        }
      }
    });

  }

  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    this.turno = this.routerActive.snapshot.paramMap.get('turno');
    console.log('user: ', this.user);
    console.log('turno: ', this.turno);
    
  }
  ngOnInit() { }

  return() {
    // window.history.back();
    if (this.turno === '1') {
      this.router.navigateByUrl('supervisor/control-matutino/tarea/1');
    }
    else {
      this.router.navigateByUrl('supervisor/control-vespertino/tarea/1');
    }
  }

  datos(){

     console.log(this.dateIni);
     console.log(this.dateFin);
     this.getTiempos();

  }

  getTiempos() {

    this.service
      .serviceGeneralGet(`Dashboard/performance-sucursal-tiempos/${this.user.branchName}/?initDate=${this.dateIni}&endDate=${this.dateFin}`)
      .subscribe((resp) => {
        if (resp.success) {
          this.data = resp.result;
          console.log("consulta", this.data);
          this.getRangos();
        }
        else{
          console.log("error", this.data);
        }
      });
    // StockChicken/Admin/All-Branch?dataBase=DB2
    
  }

  getRangos(){
    var rango0 =0;  //Desconexion
    var rango1 =0;  //rango 0-10 min
    var rango2 =0;  //rango 11-15 min
    var rango3 =0;  //rango 16-20 min
    var rangoT =0;  //total


    this.data.forEach(element =>{
        if(element.minutos == -1){ rango0++}
        if(element.minutos>=0 && element.minutos <= 15){ rango1++}
        if(element.minutos>=16 && element.minutos <= 25){ rango2++}
        if(element.minutos>=26 && element.minutos <= 30){ rango3++} 
    });

    rangoT=rango0+rango1+rango2+rango3;
    this.dataR=[
      {rango: "DESCONEXION", comandas: rango0, porcentaje:""+ ((rango0/rangoT)*100).toFixed(1)},
      {rango: "0-15 MINUTOS", comandas: rango1, porcentaje:""+ ((rango1/rangoT)*100).toFixed(1)},
      {rango: "16-25 MINUTOS", comandas: rango2, porcentaje:""+ ((rango2/rangoT)*100).toFixed(1)},
      {rango: "26-30 MINUTOS", comandas: rango3, porcentaje:""+ ((rango3/rangoT)*100).toFixed(1)}]

      // console.log("RANGOs",this.dataR)
      // console.log("RANGO Total:",rangoT)
      this.generaGrafico(((rango1/rangoT)*100),((rango2/rangoT)*100),((rango3/rangoT)*100),((rango0/rangoT)*100)); 
      

  }

  onSelect(data): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
}
class RangosDataModel {
  rango: string;
  comandas: number;
  porcentaje: string;
}