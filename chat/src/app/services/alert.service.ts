import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Alert } from './../classes/alert';

@Injectable()
export class AlertService {

  public alerts: Subject<Alert> = new Subject();
  
  constructor() { }

}
