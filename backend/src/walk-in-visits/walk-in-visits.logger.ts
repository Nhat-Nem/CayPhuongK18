import { Injectable } from "@nestjs/common";

@Injectable()
export class WalkInLogger {
    log(message: string) {
        console.log("[LOG]", message)
    }
}