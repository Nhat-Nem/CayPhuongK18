import { Injectable } from "@nestjs/common";

@Injectable()
export class PromotionsLogger {
    log(message: string) {
        console.log("[LOG]", message)
    }
}