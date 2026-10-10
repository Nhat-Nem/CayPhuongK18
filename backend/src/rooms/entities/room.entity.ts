import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("rooms")
export class Room {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  @Column({ type: "varchar", length: 50, nullable: true })
  code: string | null;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 100, default: "Standard" })
  type: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  price: number;

  // Lưu giá trị máy đọc được: AVAILABLE / UNAVAILABLE.
  // Frontend chịu trách nhiệm render thành "Đang hoạt động" / "Tạm ngưng".
  @Column({ type: "varchar", length: 20, default: "AVAILABLE" })
  status: string;

  @Column({ type: "int" })
  capacity: number;

  // Ảnh được frontend nén thành data URL nên cần MEDIUMTEXT thay vì VARCHAR(255).
  @Column({ type: "mediumtext", nullable: true })
  image: string | null;

  @Column({ type: "mediumtext", nullable: true })
  secondaryImage: string | null;
}
