import { Injectable } from "@nestjs/common";

@Injectable()
export class ReviewsLogger {
    log(message: string) {
        console.log("[LOG]", message)
    }
}