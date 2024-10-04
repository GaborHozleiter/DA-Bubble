import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EditChannelService {
  private editChannel: boolean = false;
  private openChannel: any = null;

  constructor() {}

  // Gibt true oder false zurück, je nachdem, ob editChannel true oder false ist
  isEditChannel(): boolean {
    return this.editChannel;
  }

  // Setzt den Wert von editChannel und openChannel
  setEditChannel(edit: boolean, open: any) {
    this.editChannel = edit;
    this.openChannel = open;
  }

  // Gibt den Wert von openChannel zurück
  getOpenChannel(): any {
    return this.openChannel;
  }
}
