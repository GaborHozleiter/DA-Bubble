import { Routes } from '@angular/router';
import { LogInComponent } from './landing_page/log-in/log-in.component';
import { ImpressumComponent } from './landing_page/impressum/impressum.component';
import { PrivacyPolicyComponent } from './landing_page/privacy-policy/privacy-policy.component';
import { SignUpComponent } from './landing_page/sign-up/sign-up.component';
import { HomeComponent } from './main/home/home.component';
import { ResetPasswordComponent } from './landing_page/reset-password/reset-password.component';
import { PasswordResetComponent } from './landing_page/password-reset/password-reset.component';

export const routes: Routes = [
    { path: '', component: LogInComponent},
    { path: 'sign-up', component: SignUpComponent},
    { path: 'impressum', component: ImpressumComponent},
    { path: 'privacy', component: PrivacyPolicyComponent},
    { path: 'home', component: HomeComponent},
    { path: 'reset-password', component: ResetPasswordComponent},
    { path: 'password-reset', component: PasswordResetComponent},
];
