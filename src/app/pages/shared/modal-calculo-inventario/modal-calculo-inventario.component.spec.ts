import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalCalculoInventarioComponent } from './modal-calculo-inventario.component';

describe('ModalCalculoInventarioComponent', () => {
  let component: ModalCalculoInventarioComponent;
  let fixture: ComponentFixture<ModalCalculoInventarioComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCalculoInventarioComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCalculoInventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
