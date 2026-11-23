import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute, Data } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { DialogAddPackageComponent } from '../../dialog/dialog-add-package/dialog-add-package.component';
import { LoaderComponent } from 'src/app/pages/dialog-general/loader/loader.component';
import { DialogUpdateStockPolloComponent } from '../../dialog/dialog-update-stock-pollo/dialog-update-stock-pollo.component';
import { AlertController } from '@ionic/angular';
import { DatePipe, formatNumber } from '@angular/common';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ModalCalculoInventarioComponent } from 'src/app/pages/shared/modal-calculo-inventario/modal-calculo-inventario.component';
import { element } from 'protractor';

@Component({
  selector: 'app-inventario-mensual',
  templateUrl: './inventario-mensual.component.html',
  styleUrls: ['./inventario-mensual.component.scss'],
})
export class InventarioMensualComponent implements OnInit {

  public today = new Date();
  public user: any;
  public idSucursal: string;
  public disabled = false;
  public createDate = '';
  public data;
  public registro;
  public turno;
  public pendiente = false;
  public regulariza = false;
  public dataInv: InvModel = new InvModel();
  public validado : boolean[] = [];
  public inactivo : boolean[] = [];
  public modificar : boolean[] = [];
  public contador: number[] = [];
  public strikes: number[] = [];
  public difSistema: any[]=[];
  handlerRespMessage = '';
  handlerRespValor;
  recarga = 0;
  filtro: string = '';
  public ubicacionesinv:UbicacionInvModelM[] = []; 

  constructor(
    public router: Router,
    public modalController: ModalController,
    public routerActive: ActivatedRoute,
    public service: ServiceGeneralService,
    public load: LoaderComponent,
    public alertController: AlertController,
    public datepipe: DatePipe,

  ) {    }
  ionViewWillEnter() {
    this.user = JSON.parse(localStorage.getItem('userData'));
    console.log(this.routerActive.snapshot.paramMap.get('id'));
    this.idSucursal = this.routerActive.snapshot.paramMap.get('id');
    this.turno = this.routerActive.snapshot.paramMap.get('turno');
   
    console.log('user: ', this.user);
    console.log('ionview ');
    this.GetRegistro();   
   
  }
  ngOnInit() {  }
  
  validaO(i){
     if(this.contador[i] >= 3 ){
          this.validado[i]= false;
     }
     else{
      this.validado[i]= true;
     }

  }
  iniciaModificar(i){
    this.modificar[i]= true;

  }
  iniciaCaptura(){
    this.service
      .serviceGeneralPostWithUrl(`StockChicken/AddRegistro?city=${this.user.stateId}&sucursal=${this.user.branchId}&captura=${this.user.name}`, ``)
      .subscribe((resp) => {
        if (resp.success) {
          this.registro = resp.result;
          this.GetRegistro();
        
        }
        
      });

  }

  addActualizacion(item,i){
    console.log('id actualizar: ',this.data[i].id);
    this.service
    .serviceGeneralPut(`StockChicken/ModificaCaptura?idcaptura=${this.data[i].id}&database=${this.user.dataBase}&unidades=${item.cantidadSuma}`, ``)
    .subscribe((data) => {
      if (data.success) {
        // location.reload();
        this.getCapturas(this.registro.id);
      }
    });
  }

  addCaptura(item,i){
    this.inactivo[i]= true;
    this.service
    .serviceGeneralPostWithUrl(`StockChicken/AddCaptura?city=${this.user.stateId}&sucursal=${this.user.branchId}&codarticulo=${item.codarticulo}&unidades=${item.cantidadSuma}&codAlmacen=${item.codalmacen}&registro=${this.registro.id}`, ``)
    .subscribe((resp) => {
      if (resp.success) {
        console.log('addcaptura: ',resp.result);
        // location.reload();
        this.getCapturas(this.registro.id);
      }
      else{
      this.inactivo[i]= false;
      }
    });
  }

  GetRegistro(){
    this.service
      .serviceGeneralGet(`StockChicken/GetRegistro?id_sucursal=${this.user.branch}`)
      .subscribe((resp) => {
        if (resp.success) {
          this.registro = resp.result;
          if(this.registro.id != 0 ){
            if(this.registro.procesado == false){
            console.log('con registro pendiente',this.registro);
            this.getData();
            this.getDataInventario(); 
            this.pendiente = true;
            }
            else{
              const fecha1= new Date();
              const fecha2= new Date(this.registro.dateCaptura);

              console.log('reg: ',this.registro);
              var diasdif= fecha1.getTime() - fecha2.getTime();
	            var contdias = Math.round(diasdif/(1000*60*60*24));
              console.log('diff: ',contdias);
              if(contdias < 10){
                this.alertProcesado();
              }
            }
          }
          else{
            console.log('sin registro pendiente');
          }
        
        }
        else{
          console.log('sin registro');
        }
      });
    
  }
  async alertProcesado() {
    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: 'AVISO',
      subHeader: 'INVENTARIO',
      message: 'EL INVENTARIO MENSUAL YA FUE CAPTURADO.',
      mode: 'ios',
      buttons: ['OK'],
    });
  

    await alert.present();
      const { role } = await alert.onDidDismiss();
      //this.router.navigateByUrl('login');
      window.history.back();
  }
  
  getData() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet(`StockChicken/GetStockM?id_sucursal=${this.user.branch}&dataBase=${this.user.dataBase}`)
      .subscribe((resp) => {
        if (resp.success) {
          this.data = resp.result;
          this.creaDifSistema(this.data.length);
          // Función de comparación personalizada
          const compararPorOrdenamiento = (a, b) => a.orden - b.orden;
   
          // Aplicar la ordenación al array
          this.data.sort(compararPorOrdenamiento);
          this.data.forEach(element => {
            element.cantidad = 0;
            let dataf = this.ubicacionesinv.filter(x=> x.codart == element.codarticulo && x.idu == this.user.id.toString() && x.ids == this.user.branchId.toString() && x.vista == 2);
            if(dataf.length>0)
              {
                element.cantidadSuma = dataf[0].total;
              }else
              {
                element.cantidadSuma = 0;
              }
          });
          console.log('data: ',this.data.length);
          console.log('data: ',this.data);
          this.getCapturas(this.registro.id);
        }
        console.log('s ',resp.success);
      });
    console.log('sin data');
    
  }

  creaDifSistema(numArt: number){
    
    for (let i = 0; i < numArt; i++) {
      this.difSistema.push(false);
    }
     
  }

  getCapturas(reg) {
    //this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet(`StockChicken/GetCaptura?registro=${reg}&dataBase=${this.user.dataBase}`)
      .subscribe((resp) => {
        if (resp.success) {
          var datacap = resp.result;
          var dif =0;
       
          // // Función de comparación personalizada
          // const compararPorOrdenamiento = (a, b) => a.orden - b.orden;
          console.log('length 1: ', this.data.length);
          console.log('length 2: ', datacap.length);
          // // Aplicar la ordenación al array
          // this.data.sort(compararPorOrdenamiento);
          if(this.data.length > datacap.length){
            datacap.forEach(element => {
              var index:number = this.data.map(x => x.codarticulo).indexOf(element.codarticulo);
              this.data[index].cantidad = element.unidades;
              this.data[index].id = element.id;
              this.validado[index]= false;
              this.modificar[index]= false;

              dif = element.stockAnterior - element.unidades;
              dif = dif < 0 ? dif * -1 : dif;
              if(dif >= 10){
                this.difSistema[index] = true;
              }
              // console.log('data Capturas index: ', index);
             });
             // console.log('data: ',this.data.length);
          
             console.log('array bool: ', this.difSistema);
             console.log('data Capturas cambio: ', datacap);

             console.log('data Capturas: ',resp.result);
          }
          else{
            this.regulariza = true;
            datacap.forEach(element => {
              var index:number = this.data.map(x => x.codarticulo).indexOf(element.codarticulo);
              this.data[index].cantidad = element.unidades;
              this.data[index].id = element.id;
              this.validado[index]= false;
              this.modificar[index]= false;
              dif = element.stockAnterior - element.unidades;
              dif = dif < 0 ? dif * -1 : dif;
              if(dif >= 10){
                this.difSistema[index] = true;
              }
              // console.log('data Capturas index: ', index);
             });
             console.log('array bool: ', this.difSistema);
             console.log('data Capturas cambio: ', datacap);

             console.log('data Capturas: ',resp.result);
          
          }
        }
        //console.log('s ',resp.success);
      });
   
    
  }

  return() {
    // window.history.back();
    if (this.turno === '1') {
      this.router.navigateByUrl('supervisor/control-matutino/tarea/1').then(()=>{
        location.reload();
      });;
      
    }
    else {
      this.router.navigateByUrl('supervisor/control-vespertino/tarea/1').then(()=>{
        location.reload();
      });;
      
    }
  }

  irRegulariza(){
   this.router.navigateByUrl('supervisor/inventario-regulariza/1/'+this.registro.id);
  }


  async addPackage(idPack: number) {
    console.log('id paquete', idPack);
    // package = 0 es nuevo registos, si es != 0 es update
    const modal = await this.modalController.create({
      component: DialogAddPackageComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        idSucursal: this.idSucursal, //se envia el id de sucursal
        idPackage: idPack,
      },
    });
    modal.onDidDismiss().then((data) => {
      console.log(data);
      this.ionViewWillEnter();
    });
    this.modalController.dismiss();
    return await modal.present();
  }
  deletePackage(id: number) {
    this.service
      .serviceGeneralDelete('StockChicken/' + id)
      .subscribe((resp) => {
        if (resp.success) {
          console.log('delete success', resp);
          this.load.presentLoading('Eliminando paquete..');
          this.ionViewWillEnter();
        }
      });
  }
  save(item,i) {
    this.service
      .serviceGeneralPostWithUrl(`StockChicken/AddRegularizateV?codArticulo=${item.codarticulo}&codAlmacen=${item.codalmacen}&cantidad=${item.cantidad}&dataBase=${this.user.dataBase}`, ``)
      .subscribe((resp) => {
        console.log(resp);

        if (resp.success) {

          this.load.presentLoading('Cantidad Permitida');
          this.presentAlert(i);
          // this.data.status = 'post';
          this.addInv(item,i);
        }
        else{
          location.reload();
        }
      });
    
  }

  addInv(item,i) {
    this.formartDate();
    this.dataInv.branch = this.user.branch;
    this.dataInv.invInicial = item.cantidad - item.diferencia;
    this.dataInv.invReg = item.cantidad;
    this.dataInv.diferencia = item.diferencia;
    this.dataInv.intentos = this.strikes[i];
    this.dataInv.articulo = item.descripcion;
    this.dataInv.createdBy = this.user.id;
    this.dataInv.createdDate = this.createDate;
    this.dataInv.updatedBy = this.user.id;
    this.dataInv.updatedDate = this.createDate;
    console.log('Obj To send  post=> ', this.dataInv);

    this.load.present('Guardando..');
    

    this.service
      .serviceGeneralPostWithUrl('Inventario', this.dataInv)
      .subscribe((data) => {
        if (data.success) {
          
          console.log('data inventario:', data);
          this.load.dismiss();
        }
        else{
          this.load.dismiss();
          location.reload();
        }
      });
      
  }

  formartDate() {
    // 2022-03-11T17:27:00
    console.log('date', this.today);
    let time = '';
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
    console.log('hour', hourString);
    console.log('minute', minuteString);
    time = `${hourString}:${minuteString}:00`;
    console.log('date', date);
    this.createDate = `${date}T${time}`;
  }

 

  async presentAlert(i) {
    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: 'IMPORTANTE',
      subHeader: 'INVENTARIO',
      message: 'SE REALIZO EL AJUSTE DE INVENTARIO CON EXITO. <BR>RECUERDA REINICIAR TU SISTEMA FRONTREST PARA QUE RECIBA EL AJUSTE.',
      mode: 'ios',
      buttons: ['OK'],
    });
  

    await alert.present();
      const { role } = await alert.onDidDismiss();
      console.log('onDidDismiss resolved with role', role);
      this.contador[i] += 1;
      this.validaO(i);
      this.ngOnInit();
  }
  
  filtrarDatos() {
    if(this.filtro == '')
    {
      return this.data
    } else
    {
      return this.data.filter(item => item.descripcion.toUpperCase().includes(this.filtro.toUpperCase()));
    } 
  }

  limpiarfiltro()
  {
    this.filtro = '';
    this.filtrarDatos(); 
  }


  getDataInventario() {
    this.load.presentLoading('Cargando..');
    this.service
      .serviceGeneralGet(`StockChicken/getUbicacionesInventarioMensual`)
      .subscribe((resp) => {
        this.ubicacionesinv =resp; 
        this.getData();    
      });
    
  }


  async editarvalor(item:any,ida:number, codart:number,i:number)
{
   let dataf = this.ubicacionesinv.filter(x=> x.codart == codart && x.idu == this.user.id.toString() && x.ids == this.user.branchId.toString() && x.vista == 2);
  const modal = await this.modalController.create({
    component: ModalCalculoInventarioComponent,
    componentProps: {
      param1: item.descripcion,
      param2: ida,
      param3: dataf,
      vista: 2
    }
  });
  await modal.present();

  const { data } = await modal.onWillDismiss();
  if(data.guardado)
    {
      if(dataf.length==0)
        {
          this.service
          .serviceGeneralGet(`StockChicken/getUbicacionesInventarioMensual`)
          .subscribe((resp) => {
            this.ubicacionesinv =resp;   
            item.cantidadSuma = data.total; 
          });
        } else
        {
          item.cantidadSuma = data.total; 
            dataf[0].jdata = data.arr; 
          dataf[0].total = data.total; 
        }
    
     
    }
}

eliminarUbicacionesInv(codart:number)
{
  
  let dataf = this.ubicacionesinv.filter(x=> x.codart == codart && x.idu == this.user.id.toString() && x.ids == this.user.branchId.toString() && x.vista == 2);
  
  if(dataf.length>0)
    {
      this.service
      .serviceGeneralGet(`StockChicken/EliminarUbicacionesInventario/${dataf[0].id}`)
      .subscribe((resp) => {
        if (resp.success) {
          
        }
      });
    }

}

getTotalubicaciones(element:any):Number
{
  let dataf = this.ubicacionesinv.filter(x=> x.codart == element.codarticulo && x.idu == this.user.id.toString() && x.ids == this.user.branchId.toString() && x.vista == 2);
  if(dataf.length>0)
    {
      return dataf[0].total;
    }else
    {
      return 0;
    }
}

}
class InvModel {
  id: number;
  branch: number;
  invInicial: number;
  invReg: number;
  diferencia: number;
  intentos: number;
  articulo: string;
  createdBy: number;
  createdDate: String;
  updatedBy: number;
  updatedDate: String;
}

class UbicacionInvModelM
{
 id:number;
 codart: number;
 jdata: string;
 idu:string;
 ids:string;
 vista:number;
 total:number
}