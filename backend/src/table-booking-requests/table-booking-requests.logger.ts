import { Injectable } from "@nestjs/common";

@Injectable()
export class TableBookingLogger {
    log(message: string) {
        console.log("[LOG]", message)
    }
}