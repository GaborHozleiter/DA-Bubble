import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./main/header/header.component";
import { OpenSidebarComponent } from "./main/open-sidebar/open-sidebar.component";
import { SidebarComponent } from "./main/sidebar/sidebar.component";
import { ChannelComponent } from "./main/channel/channel/channel.component";
import { LogInComponent } from "./landing_page/log-in/log-in.component";
import { CreateChannelComponent } from './main/create-channel/create-channel.component';
import { SignUpComponent } from "./landing_page/sign-up/sign-up.component";
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, OpenSidebarComponent, SidebarComponent, ChannelComponent, LogInComponent,
    CreateChannelComponent, SignUpComponent, RouterLink ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'DABubble';

  authService = inject(AuthService);

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.authService.currentUserSignal.set({
          email: user.email!,
          name: user.displayName!,
          imgUrl: user.photoURL,
          uId: user.uid
        });
      } else {
        console.log('No user data, setting currentUserSignal to null');
        this.authService.currentUserSignal.set(null);
      }
      console.log('Current user signal:', this.authService.currentUserSignal());
    });
}
  
}
