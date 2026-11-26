import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderItem } from "./order-item.entity";
import { Promotion, PromotionType } from "../../promotions/entities/promotion.entity";

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

    @Column({ name: 'table_number', type: 'varchar', length: 20, nullable: true })
    tableNumber: string | null

    @Column({ name: 'room_number', type: 'varchar', length: 20, nullable: true })
    roomNumber: string | null

    @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PENDING  })
    status: OrderStatus

    @Column({ name: 'promotion_id', type: 'bigint', nullable: true })
    promotionId: string | null

    @Column({ name: "promotion_name", type: "varchar", length: 255, nullable: true })
    promotionName: string | null

    @Column({ name: "promotion_type", type: 'enum', enum: PromotionType, nullable: true })
    promotionType: PromotionType | null

    @Column({ name: "promotion_value", type: "decimal", precision: 12, scale: 2, nullable: true })
    promotionValue: string | null

    @Column({ name: 'discount_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
    discountAmount: string

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

    @ManyToOne(() => Promotion, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'promotion_id' })
    promotion: Promotion | null

    @DeleteDateColumn({ name: "deleted_at", type: "datetime", nullable: true })
    deletedAt: Date | null
}