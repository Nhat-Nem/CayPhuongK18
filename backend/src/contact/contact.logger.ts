import { Injectable } from "@nestjs/common";

@Injectable()
export class ContactLogger {
    log(message: string) {
        console.log("[LOG]", message)
    }
}