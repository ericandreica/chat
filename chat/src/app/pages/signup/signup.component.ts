import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Alert } from 'src/app/classes/alert';
import { AlertType } from 'src/app/enums/alert-type.enum';
import { AlertService} from 'src/app/services/alert.service';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { CustomValidators } from 'src/app/classes/custom-validators';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {

  public signupForm: FormGroup;
  private subscriptions: Subscription[] = [];
  constructor(
    private fb: FormBuilder, 
    private alertService: AlertService,
    private auth: AuthService,
    private loadingService: LoadingService,
    private router: Router,
    private db: AngularFirestore
    ) { 
    this.createForm();
  }

  ngOnInit() {
  }

  private createForm():void{
    this.signupForm = this.fb.group({
      firstName: ['',Validators.required],
      lastName: ['',Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, 
        CustomValidators.patternValidator(/\d/, { hasNumber: true }),
        CustomValidators.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
        CustomValidators.patternValidator(/[a-z]/, { hasSmallCase: true }),
        Validators.minLength(8)]]
    });
  }

  public submit(): void{
    if(this.signupForm.valid){
      const {firstName,lastName,email, password}= this.signupForm.value;
      this.db.doc(`emails/${email}`).get().toPromise().then(doc => {
        if (doc.exists) {
          this.authentification(firstName,lastName,email, password);
        } else {
          const failedSignupAlert = new Alert('Wrong email!', AlertType.Danger);
          this.alertService.alerts.next(failedSignupAlert);
        }
    });
    }else{
      const failedSignedAlert = new Alert('Please enter a valid name, email and password, try again.', AlertType.Danger);
      this.alertService.alerts.next(failedSignedAlert);
    }
  }

  ngOnDestroy(){
      this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private authentification(firstName, lastName, email, password){
    this.subscriptions.push(
      this.auth.signup(firstName, lastName, email, password).subscribe(success =>{
        if(success){
          this.router.navigate(['/chat']);
        }else{
          const failedSignupAlert = new Alert('User already existing.', AlertType.Danger);
          this.alertService.alerts.next(failedSignupAlert);
        }
        this.loadingService.isLoading.next(false);
      })
    );
  }
}
