import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDTO } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly jwtService: JwtService,
    ) {}

    async login(dto: LoginDTO) {
        // 1. Tìm tài khoản theo email
        const user = await this.userRepository.findOne({
            where: {email: dto.email.trim() },
        })

        // 2. Kiểm tra tài khoản tồn tại và đang hoạt động
        if (!user || !user.is_activate) {
            throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không đúng")
        }

        // 3. Kiểm tra mật khẩu đã hash bằng bcrypt
        const isPasswordValid = await bcrypt.compare(
            dto.password,
            user.password
        )

        if (!isPasswordValid) {
            throw new UnauthorizedException("Tên đăng nhập hoặc mật khẩu không đúng")
        }

        // 4. Chỉ cho phép ADMIN đăng nhập trang quản trị
        if (user.role !== "ADMIN") {
            throw new UnauthorizedException("Bạn không có quyền truy cập quản trị")
        }

        // 5. Tạo JWT
        const payload = {
            sub: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role
        }

        const accessToken = await this.jwtService.signAsync(payload)

        // 6. Trả kết quả cho frontend
        return {
            access_token: accessToken,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        }
    }
}
