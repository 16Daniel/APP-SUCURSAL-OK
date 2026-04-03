import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InventarioArtSemanalMatComponent } from './inventario-art-semanal-mat.component';

describe('InventarioArtSemanalMatComponent', () => {
  let component: InventarioArtSemanalMatComponent;
  let fixture: ComponentFixture<InventarioArtSemanalMatComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InventarioArtSemanalMatComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InventarioArtSemanalMatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
