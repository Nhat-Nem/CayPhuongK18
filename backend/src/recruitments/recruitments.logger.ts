import { Injectable } from "@nestjs/common";

@Injectable()
export class RecruitmentLogger {
    log(message: string) {
        console.log("[LOG]", message)
    }
}