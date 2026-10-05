import { Injectable } from "@nestjs/common";

@Injectable()
export class RoomsLogger {
    log(message: string) {
        console.log("[LOG]", message)
    }
}