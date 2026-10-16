import { Injectable } from "@nestjs/common";

@Injectable()
export class CategoryLogger {
    log(message: string) {
        console.log("[LOG]", message)
    }
}