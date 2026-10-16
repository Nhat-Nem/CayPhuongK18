import { Injectable } from "@nestjs/common";

@Injectable()
export class MenuItemsLogger {
    log(message: string) {
        console.log("[LOG]", message)
    }
}