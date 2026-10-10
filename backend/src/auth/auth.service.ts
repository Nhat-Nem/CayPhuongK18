import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { User, UserRole } from "../user/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { LoginDTO } from "./dto/login.dto";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Chỉ phục vụ môi trường local/dev khi ADMIN_SEED_ENABLED=true.
   * Không thay đổi schema backend; chỉ đảm bảo tài khoản demo trong .env dùng được.
   */
  async onModuleInit() {
    const enabled =
      this.configService.get<string>("ADMIN_SEED_ENABLED") === "true";

    if (!enabled) return;

    const username =
      this.configService.get<string>("ADMIN_USERNAME")?.trim() || "admin";
    const email =
      this.configService.get<string>("ADMIN_EMAIL")?.trim() ||
      "admin@cayphuong.local";
    const password =
      this.configService.get<string>("ADMIN_PASSWORD") || "Admin@123";

    const existing = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!existing) {
      await this.userRepository.save(
        this.userRepository.create({
          username,
          email,
          password: hashedPassword,
          full_name: "Quản trị viên",
          role: UserRole.ADMIN,
          is_activate: true,
        }),
      );
      console.log(`Demo admin created: ${username}`);
      return;
    }

    // Khi seed local được bật, đồng bộ tài khoản demo với .env để tránh
    // trường hợp DB còn password cũ nhưng giao diện hiển thị password mới.
    existing.username = username;
    existing.email = email;
    existing.password = hashedPassword;
    existing.role = UserRole.ADMIN;
    existing.is_activate = true;
    if (!existing.full_name) existing.full_name = "Quản trị viên";

    await this.userRepository.save(existing);
    console.log(`Demo admin synchronized: ${username}`);
  }

  async login(dto: LoginDTO) {
    const login = dto.email.trim();

    // Cho phép nhập username hoặc email tại cùng một ô đăng nhập.
    const user = await this.userRepository.findOne({
      where: [{ email: login }, { username: login }],
    });

    if (!user || !user.is_activate) {
      throw new UnauthorizedException(
        "Tên đăng nhập hoặc mật khẩu không đúng",
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        "Tên đăng nhập hoặc mật khẩu không đúng",
      );
    }

    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException(
        "Bạn không có quyền truy cập quản trị",
      );
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    };
  }
}
