import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, } from 'typeorm';
import { BookingRequestStatus } from "../dto/update-book-request-status.dto";

@Entity('booking_requests')
export class BookRequest {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'varchar', length: 255 })
    customer_name: string;

    @Column({ type: 'varchar', length: 15 })
    customer_phone: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    customer_email?: string;

    @Column({ type: 'text', nullable: true })
    note?: string;

    @Column({
        type: 'enum',
        enum: BookingRequestStatus,
        default: BookingRequestStatus.PENDING,
    })
    status: BookingRequestStatus;

    @CreateDateColumn({ type: 'datetime' })
    created_at: Date;

    @UpdateDateColumn({ type: 'datetime' })
    updated_at: Date;
}