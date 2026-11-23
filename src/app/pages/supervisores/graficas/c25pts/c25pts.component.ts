import { Component, OnInit } from '@angular/core';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-c25pts',
  templateUrl: './c25pts.component.html',
  styleUrls: ['./c25pts.component.scss'],
})

export class C25ptsComponent implements OnInit {
  public today = new Date();
  public data: any[] = [];
  public user;
  public show: boolean = false;
  dateIni = new Date().toISOString();
  dateFin = new Date().toISOString();
  public incidenciastotal;

  public turno;

  constructor(public service: ServiceGeneralService,public router: Router,public routerActive: ActivatedRoute) { }

  ngOnInit()
   {
   
   }



  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    this.turno = this.routerActive.snapshot.paramMap.get('turno');
    console.log('user: ', this.user);
    console.log('turno: ', this.turno);
    
  }

  datos(){

    console.log(this.dateIni);
    console.log(this.dateFin);
    // this.getAudita(this.user.branchName,this.dateIni,this.dateFin);
    this.getAudita("RW ARCOS",this.dateIni,this.dateFin);

 }

  getAudita(sucursal, dateInit, dateEnd) {
    if (dateEnd == undefined || dateInit == undefined || sucursal == undefined) {
      return
    }
    debugger
    this.service
      .serviceGeneralGet(`Dashboard/performance-sucursal-25/${sucursal}/?initDate=${dateInit}&endDate=${dateEnd}`)
      .subscribe((resp) => {
        if (resp.success) {
          this.data = resp.result;
          console.log("data", this.data);
          var cont = 0;
          this.data.forEach(element =>{
                 cont++;
          });
          this.incidenciastotal = cont;
          this.contarOcurrencias(this.data);
        }
      });
    // StockChicken/Admin/All-Branch?dataBase=DB2
  }

  return() {
    // window.history.back();
    if (this.turno === '1') {
      this.router.navigateByUrl('supervisor/control-matutino/tarea/1');
    }
    else {
      this.router.navigateByUrl('supervisor/control-vespertino/tarea/1');
    }
  }  

  contarOcurrencias(registros) {
    // Utilizamos un objeto para contar las ocurrencias de cada usuario
    this.show = true;
    const contadorUsuarios = {};

    debugger
    let arrayResultante = Object.values(registros);
    // Contamos las ocurrencias de cada usuario
    arrayResultante.forEach((usuario) => {
        contadorUsuarios[usuario["usuario"]] = (contadorUsuarios[usuario["usuario"]] || 0) + 1;
    });

    // Creamos un nuevo array con el nombre del usuario y el total de veces que aparece
    const resultado = Object.entries(contadorUsuarios).map(([usuario, total]) => ({
        usuario,
        total,
    }));
 
    const nombres = resultado.map(({ usuario }) => usuario);
    const contadores = resultado.map(({ total }) => total);

    let contenedorcanvas = document.getElementById("chart-container");
    contenedorcanvas.innerHTML ='<canvas id="myChart"></canvas>';

    let canvas = document.getElementById('myChart') as HTMLCanvasElement;
    let ctx = canvas.getContext('2d');

    var mychart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: nombres,
        datasets: [{
          label: '%',
          data: contadores,
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
            text: 'INCIDENCIAS POR USUARIO'
          },
        }
      }
    });
     

}


}
