import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Room } from "../../rooms/entities/room.entity";

export enum RoomStayPaymentStatus {
    UNPAID = 'UNPAID',
    PAID = 'PAID'
}

export enum RoomStayPaymentMethod {
    CASH = 'CASH',
    CARD = 'CARD',
    BANK_TRANSFER = 'BANK_TRANSFER'
}

export enum RoomStayStatus {
    CHECKED_IN = 'CHECKED_IN',
    CHECKED_OUT = 'CHECKED_OUT'
}

@Entity('room_stays')
@Check(
    'CHK_room_stays_one_source',
    '(booking_request_id IS NOT NULL AND walk_in_visit_id IS NULL) OR (booking_request_id IS NULL AND walk_in_visit_id IS NOT NULL)',
)
export class RoomStay {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: string

    @Column({ name: "room_id", type: "bigint" })
    roomId: string

    @ManyToOne(() => Room)
    @JoinColumn({ name: 'room_id' })
    room: Room

    @Column({ name: 'booking_request_id', type: "bigint", nullable: true, unique: true })
    bookingRequestId: string | null

    @Column({ name: 'walk_in_visit_id', type: "bigint", nullable: true, unique: true })
    walkInVisitId: string | null

    @Column({ name: 'check_in_at', type: "datetime", default: () => 'CURRENT_TIMESTAMP' })
    checkInAt: Date

    @Column({ name: 'check_out_at', type: 'datetime', nullable: true })
    checkOutAt: Date | null

    @Column({ name: 'room_price', type: 'decimal', precision: 12, scale: 2 })
    roomPrice: string

    @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2, default: 0})
    totalAmount: string

    @Column({ name: 'payment_status', type: 'enum', enum: RoomStayPaymentStatus, default: RoomStayPaymentStatus.UNPAID })
    paymentStatus: RoomStayPaymentStatus

    @Column({ name: 'payment_method', type: 'enum', enum: RoomStayPaymentMethod, nullable: true })
    paymentMethod: RoomStayPaymentMethod | null

    @Column({ type: "enum", enum: RoomStayStatus, default: RoomStayStatus.CHECKED_IN })
    status: RoomStayStatus

    @Column({ name: 'paid_at', type: 'datetime', nullable: true })
    paidAt: Date | null

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}