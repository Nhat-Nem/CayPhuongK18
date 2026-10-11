import { Injectable } from "@nestjs/common";

@Injectable()
export class RoomBookingLogger {
    log(message: string) {
        console.log("[LOG]", message)
    }
}