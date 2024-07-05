import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NavParams } from '@ionic/angular';
import { ServiceGeneralService } from 'src/app/core/services/service-general/service-general.service';
import { LoaderComponent } from '../../dialog-general/loader/loader.component';
@Component({
  selector: 'app-modal-calculo-inventario',
  templateUrl: './modal-calculo-inventario.component.html',
  styleUrls: ['./modal-calculo-inventario.component.scss'],
})
export class ModalCalculoInventarioComponent {
public total:number=0; 
public ubicaciones:any[]=[]; 
public descripcion:string=''; 
public codarticulo:number|undefined;
public userdata:any; 
public isGreen:boolean = false; 
  constructor(private modalController: ModalController,private navParams: NavParams,public service: ServiceGeneralService,public load: LoaderComponent,) { }

  ngOnInit(): void {

   let dataubicaciones = this.navParams.get('param3');
    console.log(dataubicaciones);
   if(dataubicaciones.length==0)
    {
      this.ubicaciones.push({ubicacion:'Ubicación 1',uds:0})
    } else
    {
      this.ubicaciones = JSON.parse(dataubicaciones[0].jdata); 
      this.total = dataubicaciones[0].total; 
    }
   this.descripcion = this.navParams.get('param1');
   this.codarticulo = this.navParams.get('param2');

   this.userdata = JSON.parse(localStorage.getItem('userData'));
  }

  dismiss(guardado:boolean) {
    this.modalController.dismiss({
      'guardado': guardado,
      'total': this.total,
      'arr': JSON.stringify(this.ubicaciones),
    });
  }

addubicacion()
{
  let index = this.ubicaciones.length+1;
  this.ubicaciones.push({ubicacion:'Ubicación '+index,uds:0})
}

borrar(index:number)
{
  if (index > -1) {
    this.ubicaciones.splice(index, 1);
  }
  this.gettotal(); 
}

gettotal()
{ this.total = 0
  if(this.ubicaciones.length>0)
    {
      for(let item of this.ubicaciones)
        {
          this.total = this.total + item.uds;
        }
    }
  

}


guardarcalculoinv()
{
  this.load.present('Cargando..'); 
  this.isGreen = true; 
  let data = {
    codart: this.codarticulo,
    jdata: JSON.stringify(this.ubicaciones),
    idu: this.userdata.id.toString(),
    ids: this.userdata.branchId.toString(),
    vista: 1,
    total: this.total
  }
  this.service
      .serviceGeneralPostWithUrl(`StockChicken/GuardarubicacionesInventario`,data)
      .subscribe((resp) => {
        this.dismiss(true); 
        this.load.dismiss(); 
      });
}


}
