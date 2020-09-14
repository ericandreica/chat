import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Alert } from 'src/app/classes/alert';
import { AlertType } from 'src/app/enums/alert-type.enum';
import { AlertService} from 'src/app/services/alert.service';
import { LoadingService } from 'src/app/services/loading.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  public loginForm: FormGroup;
  private subscriptions: Subscription[] = [];
  private returnUrl: string;
  constructor(
    private fb: FormBuilder, 
    private alertService: AlertService,
    private loadingService: LoadingService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
    ) { 
    this.createForm();
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/chat';

    this.subscriptions.push(
      this.auth.currentUser.subscribe(user => {
        if(!!user){
          this.router.navigateByUrl('/chat');
        }
      })
    );
  }

  private createForm(): void{
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  public submit(): void{
    
    if(this.loginForm.valid){
      this.loadingService.isLoading.next(true);
      const {email, password}= this.loginForm.value;
      this.subscriptions.push(
        this.auth.login(email, password).subscribe(success => {
          if(success){
            this.router.navigateByUrl(this.returnUrl);
          }else{
            this.displayFailedLogin(); 
          }
          this.loadingService.isLoading.next(false); 
        })
      );
    }
    else{
      this.loadingService.isLoading.next(false);   
      this.displayFailedLogin(); 
    }
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private displayFailedLogin(): void {
    const failedLoginAlert = new Alert('Your email or password were invalid, try again.', AlertType.Danger);    
    this.alertService.alerts.next(failedLoginAlert);
  }
}
