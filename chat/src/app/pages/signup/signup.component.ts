import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators, EmailValidator } from '@angular/forms';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  public signupForm: FormGroup;

  constructor(private fb: FormBuilder) { 
    this.createForm();
  }

  ngOnInit() {
  }

  private createForm():void{
    this.signupForm = this.fb.group({
      firstName: ['',Validators.required],
      lastName: ['',Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  public submit(): void{
    //TODO
    const {firstName,lastName,email, password}= this.signupForm.value;
    console.log(`FirstName: ${firstName}, LastName: ${lastName}, Email: ${email}, Password: ${password}`);
  }
}
