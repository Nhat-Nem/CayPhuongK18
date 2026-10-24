import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderItem } from "./order-item.entity";

export enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

export enum PaymentStatus {
    UNPAID = "UNPAID",
    PAID = "PAID"
}

export enum PaymentMethod {
    CASH = "CASH",
    BANK_TRANSFER = "BANK_TRANSFER",
    CARD = "CARD"
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

    @Column({ name: "payment_status", type: "enum", enum: PaymentStatus, default: PaymentStatus.UNPAID })
    paymentStatus: PaymentStatus
    
    @Column({ name: "payment_method", type: "enum", enum: PaymentMethod, nullable: true })
    paymentMethod: PaymentMethod | null

    @Column({ name: "paid_at", type: "datetime", nullable: true })
    paidAt: Date | null

    @Column({ name: "created_by", type: "bigint", nullable: true  })
    createdBy: string | null

    @OneToMany(() => OrderItem, (item) => item.order) 
    items: OrderItem[]

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date
}