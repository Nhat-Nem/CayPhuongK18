
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum PromotionType {
    PERCENTAGE = 'PERCENTAGE',
    FIXED_AMOUNT = 'FIXED_AMOUNT' 
}

export enum PromotionAppliesTo {
    RESTAURANT = 'RESTAURANT',
    HOTEL = 'HOTEL',
}

export enum PromotionStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

@Entity('promotions')
export class Promotion {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: string;

    @Column({ length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'discount_type', type: 'enum', enum: PromotionType })
    discountType: PromotionType;

    @Column({ name: 'discount_value', type: 'decimal', precision: 12, scale: 2 })
    discountValue: number;

    @Column({ name: 'applies_to', type: 'enum', enum: PromotionAppliesTo })
    appliesTo: PromotionAppliesTo;

    @Column({ name: 'start_date', type: 'datetime' })
    startDate: Date;

    @Column({ name: 'end_date', type: 'datetime' })
    endDate: Date;

    @Column({ type: 'enum', enum: PromotionStatus, default: PromotionStatus.ACTIVE })
    status: PromotionStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
