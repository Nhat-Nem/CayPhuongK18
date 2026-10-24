import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('table-booking-requests')
export class TableBookingRequest {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: string

    @Column({ name: "customer_name", type: "varchar", length: 255 })
    customerName: string

    @Column({ name: "customer_phone", type: "varchar", length: 255 })
    customerPhone: string

    @Column({ name: "customer_email", type: "varchar", length: 255, nullable: true })
    customerEmail: string | null

    @Column({ type: 'text', nullable: true })
    note: string | null

    @Column({ type: "varchar", length: 50, default: "PEDING" })
    status: string

    @CreateDateColumn({ name: "created_at", type: "datetime" })
    createdAt: Date

    @UpdateDateColumn({ name: "updated_at", type: "datetime" })
    updatedAt: Date
}