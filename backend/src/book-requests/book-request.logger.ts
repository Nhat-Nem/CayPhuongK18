import { Injectable } from "@nestjs/common";

@Injectable()
export class BookRequestLogger {
    log(message: string) {
        console.log("[LOG]", message)
    }
}