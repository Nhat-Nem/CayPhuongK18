import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

import { BookingRequestStatus } from "../dto/update-book-request-status.dto";

@Entity("booking_requests")
export class BookRequest {
  @PrimaryGeneratedColumn({
    type: "bigint",
  })
  id: number;

  @Column({
    type: "varchar",
    length: 255,
  })
  customer_name: string;

  @Column({
    type: "varchar",
    length: 15,
  })
  customer_phone: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  customer_email?: string;

  @Column({
    type: "text",
    nullable: true,
  })
  note?: string;

  @Column({
    type: "enum",
    enum: BookingRequestStatus,
    default: BookingRequestStatus.PENDING,
  })
  status: BookingRequestStatus;

  @Column({
    type: "datetime",
  })
  created_at: Date;

  @Column({
    type: "datetime",
  })
  updated_at: Date;

  @BeforeInsert()
  setCreateDate() {
    const now = new Date();

    this.created_at = now;
    this.updated_at = now;
  }

  @BeforeUpdate()
  setUpdateDate() {
    this.updated_at = new Date();
  }
}