import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const authHeader = request.headers.authorization

        if (!authHeader) {
            throw new UnauthorizedException("Vui lòng đăng nhập")
        }

        const token = authHeader.substring(7)

        try {
            const payload = await this.jwtService.verifyAsync(token)
            request.user = payload
            return true
        } catch {
            throw new UnauthorizedException("Token không hợp lệ hay đã hết hạn")
        }
    }
}