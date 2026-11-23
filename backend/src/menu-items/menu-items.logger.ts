import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class MenuItemsLogger {
    private readonly logger = new Logger(MenuItemsLogger.name)
    
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