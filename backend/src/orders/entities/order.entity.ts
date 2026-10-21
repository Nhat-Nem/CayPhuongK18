import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderItem } from "./order-item.entity";

export enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

@Entity("orders")
export class Order {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: string

    @Column({ unique: true, length: 50 })
    code: string

    @Column({ type: "text", nullable: true })
    note: string | null

    @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PENDING  })
    status: OrderStatus

    @Column({ name: "total_amount", type: "decimal", precision: 12, scale: 2, default: 0 })
    totalAmount: string 

    @Column({ name: "created_by", type: "bigint", nullable: true  })
    createdBy: string | null

    @OneToMany(() => OrderItem, (item) => item.order) 
    items: OrderItem[]

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date
}