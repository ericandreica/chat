import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AlertService } from '../services/alert.service';
import { Alert } from '../classes/alert';
import { AlertType } from '../enums/alert-type.enum';
import { map, tap, take} from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class IsOwnerGuard implements CanActivate {
  
  constructor(
    private auth: AuthService,
    private router: Router,
    private alertService: AlertService
  ){

  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.auth.currentUser.pipe(
      take(1),
      map((currentUser) => !!currentUser && currentUser.id === next.params.userId),
      tap((isOwner)=>{
        if(!isOwner){
          this.alertService.alerts.next(new Alert('You can only edit your profile.', AlertType.Danger));
          this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
        }
      })
    );
  }
  
}
