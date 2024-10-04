export interface Message {
    id: string;
    channelId: string;
    message: string;
    uid: string;
    weekday: string;
    year: number;
    // További mezők, amik a Firestore-ban vannak
    [key: string]: any; 
}
