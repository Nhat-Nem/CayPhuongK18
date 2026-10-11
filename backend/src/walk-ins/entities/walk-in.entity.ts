import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

export enum WalkInServiceType {
  ROOM = "ROOM",
  RESTAURANT = "RESTAURANT",
}

export enum WalkInStatus {
  WAITING = "WAITING",
  SERVING = "SERVING",
  COMPLETED = "COMPLETED",
}

@Entity("walk_ins")
export class WalkIn {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id: number;

  // Được tạo sau lần save đầu tiên từ id: VL-000001, VL-000002, ...
  @Column({ type: "varchar", length: 20, nullable: true, unique: true })
  code: string | null;

  @Column({ name: "full_name", type: "varchar", length: 255 })
  fullName: string;

  @Column({ type: "varchar", length: 20 })
  phone: string;

  @Column({
    type: "enum",
    enum: WalkInServiceType,
  })
  service: WalkInServiceType;

  @Column({ type: "int", default: 1 })
  guests: number;

  // Chỉ lưu room id để backend walk-ins ít phụ thuộc schema phòng hiện tại.
  @Column({ name: "room_id", type: "bigint", nullable: true })
  roomId: number | null;

  @Column({ type: "text", nullable: true })
  note: string | null;

  @Column({
    type: "enum",
    enum: WalkInStatus,
    default: WalkInStatus.WAITING,
  })
  status: WalkInStatus;

  // Không dùng DEFAULT CURRENT_TIMESTAMP để tránh lỗi datetime trên MySQL local.
  @Column({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @Column({ name: "updated_at", type: "datetime" })
  updatedAt: Date;

  @BeforeInsert()
  setCreateTime() {
    const now = new Date();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @BeforeUpdate()
  setUpdateTime() {
    this.updatedAt = new Date();
  }
}
