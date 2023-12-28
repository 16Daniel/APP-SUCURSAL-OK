/* eslint-disable max-len */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { LoaderComponent } from 'src/app/pages/dialog-general/loader/loader.component';
import { DialogNotificationComponent } from 'src/app/pages/nav/dialog-notification/dialog-notification.component';
import { LogoutComponent } from 'src/app/pages/popover/logout/logout.component';
import { AlertController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { AudioService } from 'src/app/services/audio.service';
import { getDate } from 'date-fns';


@Component({
  selector: 'app-centro-control-vespertino',
  templateUrl: './centro-control-vespertino.component.html',
  styleUrls: ['./centro-control-vespertino.component.scss'],
})
export class CentroControlVespertinoComponent implements OnInit, OnDestroy  {
  public user: any;
  public vespertino = 2;
  public data: any[] = [];
  public dataNotification: any = [];
  // nombre de sucursal
  public branchId;
  // public nameBranch = '';
  public dataBranch: any[] = [];
  // se juntaron tablet y alarma
  public tabletAlarmaActive = false;
  public completeTablAndAlarm = false;
  public progressTablAndAlarm = 0;
  public colorTablAndAlarm;
  public today;
  public countAlarm = 0;
  public countVoladoEfectivo = 0;
  public valueVolado;
  public time;
  // variable menu seleccionable
  public task;
  public completada;
  public Tableta;
  public Alarma;
  public cant;
  public contador = null;
  public tunoCorre = 0;
  public ValUsuario = 1;
  public contador1 = null;
  public Inventario;
  public SemInv = false;

  public barProgressTask: number;
  public barProgressTask1: number;
  public color: string;

  constructor(
    public router: Router,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    public modalController: ModalController,
    public popoverCtrl: PopoverController,
    public alertController: AlertController,
    public routerActive: ActivatedRoute,
    public datepipe: DatePipe,
    private audio: AudioService

  ) { }

  ionViewWillEnter() {
    console.log('viewwillenter');
    //this.user = JSON.parse(localStorage.getItem('userData'));
    //console.log('user', this.user);
    // obtener el nombre de sucursal
    //this.branchId = this.user.branchId;
    //this.task = this.routerActive.snapshot.paramMap.get(`idTarea`);
    // this.getBranch();
    //this.notificationVoladoEfectivo();
    this.getDataControl(this.task);
    // this.notificationAlarm();
    this.getInventario();
    this.audio.preload('alerta', 'assets/audio/1.mp3');
    
    var Hrs = new Date().getHours();
    var ampm = Hrs >= 12 ? 'PM' : 'AM';
    if(ampm == "PM" && Hrs >= 22){
      this.SemInv = true;
    }
    else{
      if(Hrs <= 3){
        this.SemInv = true;
      }
      else{
        this.SemInv = false;
      }
      
    }


  }
  ngOnInit() {
    this.today = new Date();
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log('user', this.user);
    this.task = this.routerActive.snapshot.paramMap.get(`idTarea`);
    this.branchId = this.user.branchId;
    //this.getNotification();
    //this.notificationVoladoEfectivo();
    //this.getDataControl(this.task);
    //this.notificationAlarm();
    console.log('hora', this.today.getHours());
    this.startTimer();

    // if(this.today.getDay() === 0 || this.today.getDay() === 1 ){
    //   if(this.today.getDay() === 1 && this.today.getHours() < 7){
    //     this.SemInv = true;
    //     console.log('hora', this.today.getHours());
    //   }
    //   else{

    //     this.SemInv = false;
    //     if(this.today.getDay() === 0 ){this.SemInv = true;}
    //   }
      
    // }
    // else{this.SemInv = false;}


  }
  ngOnDestroy() {
    this.stopTimer();
    this.stopaudioLoop();
  }
  getDataControl(task) {
    // this.load.presentLoading('Cargando..');
    if(task != 3){
    this.service
      .serviceGeneralGet(`ControlCenter/${this.user.branchId}/${this.vespertino}/${task}/${this.user.id}/Manager`)
      .subscribe((resp) => {
        if (resp.success) {
          this.data = resp.result.controlCenters;
          this.barProgressTask = resp.result.progress;
          this.barProgressTask1 = resp.result.progress;
          if (this.barProgressTask === 0){
            this.color = 'danger';
          }
          else if (this.barProgressTask === 100){
            this.color = 'success';
          }
          else{
            this.color = 'warning';
          }
          console.log('control vespertino', resp.result);

          //SE ASIGNA EL VALOR DE LA TAREA DE VOLADO DE EFECTIVO
          this.data.filter(data => data.name === "Volado de efectivo").map(data => {this.completada = data.isComplete;});
          //SE ASIGNA EL VALOR DE LA TAREA RESGUARDO DE TABLETA
          this.data.filter(data => data.name === "RESGUARDO DE TABLETA").map(data => {this.Tableta = data.isComplete;});
          //SE ASIGNA EL VALOR DE LA TAREA ALARMA
          //this.data.filter(data => data.name === "ALARMA").map(data => {this.Alarma = data.isComplete;});

          console.log('control volado', this.completada);
          this.notificationVoladoEfectivo();
        //  if(Number(this.valueVolado.message) < 3000){
        //     this.cant = false;
     
        //     if(this.completada === false){
        //     this.barProgressTask = this.barProgressTask + 14.28571428571429;
        //     }

        //  }
        //  else{
        //     this.cant = true;
     
        //     if(this.completada === true){
        //       this.barProgressTask = this.barProgressTask - 14.28571428571429;
        //       }

        //  }
        

        

        }
        
      });
    }
  }

  showUsuario(){
    if(this.ValUsuario == 1){
      this.ValUsuario = 70;
    }
    else{
      if(this.ValUsuario == 70){
        this.ValUsuario = 71;
      }
      else{
      this.ValUsuario = 1;
      }
    }
  }

  activeTabletAndAlarma() {

    this.tabletAlarmaActive = true;
    if (this.Tableta === false) {
      this.completeTablAndAlarm = false;
      if (this.Tableta === false ) {
        this.progressTablAndAlarm = 0;
        this.colorTablAndAlarm = 'danger';
      }
      else if (this.Tableta === true) {
        this.progressTablAndAlarm = 1;
        this.colorTablAndAlarm = 'warning';
      }
    }
    else {
      this.completeTablAndAlarm = true;
      this.colorTablAndAlarm = 'success';
      this.progressTablAndAlarm = 100;
    }
    
  }
  return() {
    console.log('return');
    this.router.navigateByUrl('supervisor');
    // window.history.back();
  }
  async notificationAlarm() {
    const timeAlarmaIni = '22:00:00';
    const timeAlarmaFin = '23:00:00';
    if (this.countAlarm === 0) {
      const time = `${this.today.getHours()}:${this.today.getMinutes()}:00`;
      // console.log('time', time);
      if (time >= timeAlarmaIni && time <= timeAlarmaFin) {
        this.countAlarm += 1;
        const alert = await this.alertController.create({
          cssClass: 'custom-alert',
          header: 'Alerta',
          message: 'Recuerda activar la Alarma y subir la evidencia correspondiente',
          mode: 'ios', //sirve para tomar el diseño de ios
          buttons: ['OK']
        });
        await alert.present();
        const { role } = await alert.onDidDismiss();
        console.log('onDidDismiss resolved with role', role);
        console.log('count alarm', this.countAlarm);
      }
    }
  }
  async notificationVoladoEfectivo() {
    this.valueVolado = [];
    console.log('date', this.today);
    let timeTemp = '';
    const hour = this.today.getHours();
    const minute = this.today.getMinutes();
    let hourString = hour.toString();
    let minuteString = minute.toString();
    const date = this.datepipe.transform(this.today, 'yyyy-MM-dd');
    if (hourString.length < 2) {
      hourString = `0${hourString}`;
    }
    if (minuteString.length < 2) {
      minuteString = `0${minuteString}`;
    }
    timeTemp = `${hourString}:${minuteString}:00`;
    this.time = `${date}T${timeTemp}`;
    console.log('format date', this.time);
    this.service.serviceGeneralGet(`CashRegisterShortage/GetCash?id_sucursal=${this.user.branch}&dataBase=${this.user.dataBase}`).subscribe(resp => {
      if (resp.message > 3000) {
        // si entra success el volado es mayor a 3000
        this.valueVolado = resp;
        this.valueVolado.message = Number(this.valueVolado.message);
        this.valueVolado.time = this.time;
        console.log('valor', this.valueVolado);
        localStorage.setItem('valueVolado', JSON.stringify(this.valueVolado));
        //SE DETINE EL TIMER DE ACTUALIZADO DE VOLADO
        this.audioLoop();
        this.stopTimer();
        this.alertVolado();
        console.log('succes 3000 ', resp)
      }
      else {

        // prueba
        // this.valueVolado = resp;
        // this.valueVolado.message = 3000;
        // this.valueVolado.time = this.time;
        // console.log('valor', this.valueVolado);
        // localStorage.setItem('valueVolado', JSON.stringify(this.valueVolado));
        // this.alertVolado();
        // //
        // this.valueVolado = resp;
        // this.valueVolado.time = this.time;
        this.valueVolado = resp;
        this.valueVolado.message = Number(this.valueVolado.message);
        localStorage.setItem('valueVolado', JSON.stringify(this.valueVolado));
        console.log('Aun no hay 3mil pesos', this.valueVolado);

      }

      if(this.valueVolado.message < 3000){
        this.cant = false;
 
        if(this.completada === false){
          this.barProgressTask =0;
        this.barProgressTask = this.barProgressTask1 + 14.28571428571429;
        }

     }
     else{
      if(this.valueVolado.message == undefined){
        this.cant = false;
        if(this.completada === false){
          this.barProgressTask =0;
          this.barProgressTask = this.barProgressTask1 + 14.28571428571429;
          }
       }
       else{
        this.cant = true;
 
        if(this.completada === true){
          this.barProgressTask =0;
          this.barProgressTask = this.barProgressTask1 - 14.28571428571429;
          }
        }
     }
     console.log('cant', this.cant);
     this.activeTabletAndAlarma();
    });
  }

    //FUNCIONES DEL TIMER DE VOLADO DE EFECTIVO
    startTimer() {
      this.stopTimer();
      this.contador = setInterval((n) => { 
        this.notificationVoladoEfectivo();
        this.tiempoCaptura();
        console.log('muestra timer'); }, 20000);
    }
    
    stopTimer() {
      
        clearInterval(this.contador);
      
    }
    audioLoop() {
      this.stopaudioLoop();
      this.contador1 = setInterval((n) => { 
        this.audio.play('alerta');
        console.log('reproduce timer'); }, 4000);
    }
    stopaudioLoop() {
    
      clearInterval(this.contador1);
    
    }

    tiempoCaptura(){
      const dia = new Date();
      if(dia.getHours() > 19 && dia.getHours() < 21 && this.data[1].isComplete == false){
       console.log('carga 1', dia.getHours());
       this.stopTimer();
       this.audioLoop();
       this.alertCaptura();
      }
  
    }

    turnoActual(){
      this.tunoCorre =0;
      this.today = new Date();
      var time = this.today.getHours();
      
        console.log('Hora:', time);
        
         
        if ( time > 19 && time < 21) {
          this.tunoCorre = 1;
          this.alertFinal();
        }
        
  
    }

    async alertCaptura(){
    
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'IMPORTANTE',
        subHeader: 'CAPTURA',
        message: 'CAPTURA MESAS EN ESPERA',
        mode: 'ios',
        buttons: ['OK'],
      });
      
      await alert.present();
      const { role } = await alert.onDidDismiss();
      console.log('onDidDismiss resolved with role', role);
      
      this.stopaudioLoop();
      this.startTimer();
  
    }

    async alertCapturaValida(){
    
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'IMPORTANTE',
        subHeader: 'CAPTURA',
        message: 'LA CAPTURA ES SOLO DE 8:00PM - 9:00PM',
        mode: 'ios',
        buttons: ['OK'],
      });
      
      await alert.present();
      const { role } = await alert.onDidDismiss();
      console.log('onDidDismiss resolved with role', role);
        
    }
  
    async alertFinal(){
      this.stopTimer();
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'IMPORTANTE',
        subHeader: 'TURNO',
        message: 'SE TERMINO EL HORARIO DE CAPTURA DE TAREAS DEL TURNO VESPERTINO. <BR>TU TURNO FINALIZARA',
        mode: 'ios',
        buttons: ['OK'],
      });
      await alert.present();
      const { role } = await alert.onDidDismiss();
      console.log('onDidDismiss resolved with role', role);
      
      this.terminarTurno();
  
    }

  async alertVolado(){
    if (this.valueVolado.success === true) {
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'Realiza el volado de efectivo',
        subHeader: `Por $ ${this.valueVolado.message} MXN`,
        message: 'Se activara un cronómetro para identificar en cuánto tiempo se hizo el volado de efectivo.',
        mode: 'ios', //sirve para tomar el diseño de ios
        buttons: ['OK']
      });
      await alert.present();
      const { role } = await alert.onDidDismiss();
      console.log('onDidDismiss resolved with role', role);
      //SE INICIA TIMER DE VOLADO DE EFECTIO
      this.startTimer();
      this.stopaudioLoop();
      //this.startTimer();
    }
  }
  //*****************notification*****************************
  async openNotification() {
  // package = 0 es nuevo registos, si es != 0 es update
  const modal = await this.modalController.create({
    component: DialogNotificationComponent,
    cssClass: 'custom-alert',
    swipeToClose: true,
    componentProps: {
      id: this.user.branchId, //se envia el id de sucursal
    },
  });
  modal.onDidDismiss().then((data) => {
    console.log(data);
    this.ionViewWillEnter();
  });
  this.modalController.dismiss();
  return await modal.present();
}

  async logout(e: any) {
  const popover = await this.popoverCtrl.create({
    component: LogoutComponent,
    cssClass: 'custom-alert',
    event: e,
    translucent: true,
    mode: 'ios', //sirve para tomar el diseño de ios
    backdropDismiss: true,
  });
  return await popover.present();

}


showTermina() {
  this.alertController.create({
    cssClass: 'custom-alert',
    header: 'ADVERTENCIA',
    subHeader: 'TERMINA TURNO',
    message: '¿ESTAS SEGURO DE TERMINAR TURNO?',
    mode: 'ios', 
    buttons: [
      {
        text: 'CANCELAR',
        handler: (data: any) => {
          console.log('TERMINAR TURNO CANCELADO');
        }
      },
      {
        text: 'ACEPTAR',
        handler: (data: any) => {
          console.log('TERMINAR TURNO');
          //this.showValidaTermina();
          this.terminarTurno();
        }
      }
    ]
  }).then(res => {
    res.present();
  });
}

showValidaTermina() {
  this.alertController.create({
    cssClass: 'custom-alert',
    header: 'IMPORTANTE',
    subHeader: 'TERMINAR TURNO',
    message: 'AL TERMINAR EL TURNO YA NO PODRAS INGRESAR NUEVAMENTE',
    mode: 'ios', 
    buttons: [
      {
        text: 'CANCELAR',
        handler: (data: any) => {
          console.log('TERMINAR TURNO CANCELADO');
        }
      },
      {
        text: 'ACEPTAR',
        handler: (data: any) => {
          console.log('TERMINAR');
          this.terminarTurno();
        }
      }
    ]
  }).then(res => {
    res.present();
  });
}

getInventario() {
  this.load.presentLoading('Cargando..');
  this.service
    .serviceGeneralGet(`StockChicken/GetStockV?id_sucursal=${this.user.branch}&dataBase=${this.user.dataBase}`)
    .subscribe((resp) => {
      if (resp.success) {
        this.Inventario = resp.result;
        this.Inventario.forEach(element => {
          element.cantidad = 0;
        });
        console.log("objetos inv: ",this.Inventario.length);
      }
      console.log('s ',resp.success);
    });
  console.log('sin data inventario');
}


validacionAsistencia() {
  this.stopTimer();
  this.router.navigateByUrl('supervisor/validacion-assistencia/2');
}
terminarTurno() {
  this.stopTimer();
  this.router.navigateByUrl('supervisor');
}
remisiones(id) {
  if (id === null) {
    id = 0;
  }
  this.stopTimer();
  this.router.navigateByUrl('supervisor/remisiones/2/' + id);
}
getNotification() {
  this.service
    .serviceGeneralGet('Transfer/Notifications?id=' + this.user.branchId)
    .subscribe((resp) => {
      if (resp.success) {
        this.dataNotification = resp.result;
        console.log('notificaciones', this.dataNotification);
      }
    });
}
productoRiesgo(id) {
  if(this.data[10].isComplete == false){
    if (id === null) {
      id = 0;
    }
    this.stopTimer();
    this.router.navigateByUrl(`supervisor/producto-riesgo/2/${id}`+'/'+this.ValUsuario);
  }
}
albaranes(id) {
  if (id === null) {
    id = 0;
  }
  this.stopTimer();
  this.router.navigateByUrl('supervisor/albaranes/' + id);
}
transferencias(id) {
  if (id === null) {
    id = 0;
  }
  this.stopTimer();
  this.router.navigateByUrl('supervisor/transferencias/2/' + id);
}
voladoEfectivo(id) {
  if (id === null) {
    id = 0;
  }
  this.stopTimer();
  this.router.navigateByUrl('supervisor/volado-efectivo/2/' + id+'/'+this.ValUsuario);
}
resguardoPropina(id) {
  if(this.data[3].isComplete == false){
    if (id === null) {
      id = 0;
    }
    this.stopTimer();
    this.router.navigateByUrl('supervisor/resguardo-propina/' + id+'/'+this.ValUsuario);
  }
}
limpiezaSalonBanos(id) {
  if(this.data[4].isComplete == false){
    if (id === null) {
      id = 0;
    }
    this.stopTimer();
    this.router.navigateByUrl('supervisor/limpieza-salon-banos/' + id +'/'+this.ValUsuario);
  }
}
resguardoTableta(id) {
  if (id === null) {
    id = 0;
  }
  this.stopTimer();
  this.router.navigateByUrl('supervisor/resguardo-tableta/' + id+'/'+this.ValUsuario);
}
alarma(id) {
  if(this.data[9].isComplete == false){
    if (id === null) {
      id = 0;
    }
    this.stopTimer();
    this.router.navigateByUrl('supervisor/alarma/' + id);
  }
}
tabletAndAlarma(idTablet, idAlarma) {
  if(this.data[5].isComplete == false){
    if (idTablet === null) {
      idTablet = 0;
    }
    if (idAlarma === null) {
      idAlarma = 0;
    }
    this.stopTimer();
    console.log(`id tablet ${idTablet} id tablet ${idAlarma}`);
    this.router.navigateByUrl(`supervisor/resguardo-tableta/${idTablet}/alarma/${idAlarma}`+'/'+this.ValUsuario);
  }
}
mesas(id: number) {
  var time  = new Date().getHours();
  if(time > 19 && time < 21){
    if(this.data[1].isComplete == false){
      if (id === null) {
        id = 0;
      }
      this.stopTimer();
      this.router.navigateByUrl(`supervisor/mesa-espera/2/${id}`+'/'+this.ValUsuario);
    }
  }
  else{
    this.alertCapturaValida();
  }
}



banosMatutino(id: number, tp: number) {
  if(tp == 1){
    if(this.data[8].isComplete == false){
      if (id === null) {
        id = 0;
      }
      this.stopTimer();
      this.router.navigateByUrl('supervisor/banos-matutino/2/' + id+'/'+this.ValUsuario+'/'+ tp);
    }
  }
  else{
    if(this.data[9].isComplete == false){
      if (id === null) {
        id = 0;
      }
      this.stopTimer();
      this.router.navigateByUrl('supervisor/banos-matutino/2/' + id+'/'+this.ValUsuario+'/'+ tp);
    }
  }
}

stockPollo(id: number) {
  if(this.Inventario.length != 0){
    if (id === null) {
      id = 0;
    }
    this.stopTimer();
    this.router.navigateByUrl('supervisor/inventario-semanal/2/' + id+'/'+this.ValUsuario);
    
  }
}

graficaTiempos() {
    
    this.stopTimer();
    this.router.navigateByUrl('supervisor/grafica-tiempos/2/'+this.ValUsuario);
    
}

}
