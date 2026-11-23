import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class OrdersLogger {
    private readonly logger = new Logger(OrdersLogger.name)

    log(message: string) {
        this.logger.log(message)
    }
    
    error(message: string, trace?: string) {
        this.logger.error(message, trace)
    }
    
    warn(message: string) {
        this.logger.warn(message)
    }
}