import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { RoomStay, RoomStayPaymentStatus, RoomStayStatus } from './entities/room-stay.entity';
import { Repository } from 'typeorm';
import { Room } from '../rooms/entities/room.entity';
import { RoomBookingRequest } from '../room-booking-requests/entities/room-booking-request.entity';
import { WalkInVisit } from '../walk-in-visits/entities/walk-in-visit.entity';
import { DataSource } from 'typeorm';
import { CreateRoomStayDto } from './dto/create-room-stay.dto';
import { CheckoutRoomStayDto } from './dto/checkout-room-stay.dto';

@Injectable()
export class RoomStaysService {
    constructor(
        @InjectRepository(RoomStay)
        private readonly roomStayRepository: Repository<RoomStay>,

        @InjectRepository(Room)
        private readonly roomRepository: Repository<Room>,

        @InjectRepository(RoomBookingRequest)
        private readonly roomBookingRequestRepository: Repository<RoomBookingRequest>,

        @InjectRepository(WalkInVisit)
        private readonly walkInVisitRepository: Repository<WalkInVisit>,

        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {}

    async findAll() {
        return this.roomStayRepository.find({
            relations: { room: true },
            order: { createdAt: 'DESC' },
        })
    }

    // Check in
    async checkIn(dto: CreateRoomStayDto) {
        const hasBooking = !!dto.bookingRequestId
        const hasWalkIn = !!dto.walkInVisitId

        if (hasBooking === hasWalkIn) {
            throw new BadRequestException("Exactly one of the following two IDs must be provided: bookingRequestId or walkInVisitId")
        }

        return this.dataSource.transaction(async (manager) => {
            const roomRepository = manager.getRepository(Room)
            const stayRepository = manager.getRepository(RoomStay)
            const bookingRepository = manager.getRepository(RoomBookingRequest)
            const walkInRepository = manager.getRepository(WalkInVisit)

            const room = await roomRepository.findOne({
                where: { id: dto.roomId as any },
                lock: { mode: 'pessimistic_write' }
            })

            if (!room) {
                throw new NotFoundException("Room not found")
            }

            const activeStay = await stayRepository.findOne({
                where: {
                    roomId: dto.roomId,
                    status: RoomStayStatus.CHECKED_IN,
                },
            })

            if (activeStay) {
                throw new BadRequestException("The room is currently occupied.")
            }
            
            let bookingRequestId: string | null = null;
            let walkInVisitId: string | null = null;

            if (hasBooking) {
                const request = await bookingRepository.findOne({
                    where: { id: dto.bookingRequestId! },
                    lock: { mode: 'pessimistic_write' },
                });

                if (!request) {
                    throw new NotFoundException('Booking request not found');
                }

                if (request.status !== 'CONFIRMED') {
                    throw new BadRequestException(
                        'Check-in is permitted only once the request has been confirmed',
                    );
                }

                bookingRequestId = request.id;
            } else {
                const visit = await walkInRepository.findOne({
                    where: { id: dto.walkInVisitId! },
                    lock: { mode: 'pessimistic_write' },
                });

                if (!visit) {
                    throw new NotFoundException('No walk-in guests found');
                }

                if (visit.serviceType !== 'ROOM') {
                    throw new BadRequestException(
                        'These guests are not using room services.',
                    );
                }

                if (visit.status !== 'PENDING') {
                    throw new BadRequestException(
                        'Walk-in guests are not waiting for check-in',
                    );
                }

                walkInVisitId = visit.id;
            }

            // Tạo lượt lưu trú cho cả booking và walk-in
            const stay = stayRepository.create({
                roomId: String(room.id),
                bookingRequestId,
                walkInVisitId,
                roomPrice: String(room.price),
                totalAmount: '0.00',
                paymentStatus: RoomStayPaymentStatus.UNPAID,
                paymentMethod: null,
                status: RoomStayStatus.CHECKED_IN,
                checkInAt: new Date(),
                checkOutAt: null,
                paidAt: null,
            });

            const savedStay = await stayRepository.save(stay);

            // Cập nhật trạng thái nguồn
            if (hasBooking) {
                await bookingRepository.update(
                    dto.bookingRequestId!,
                    { status: 'COMPLETED' as any },
                );
            } else {
                await walkInRepository.update(
                    dto.walkInVisitId!,
                    { status: 'SERVING' },
                );
            }

            return savedStay;
        })
    }

    async checkOut(id: string, dto: CheckoutRoomStayDto) {
        return this.dataSource.transaction(async (manager) => {
            const stayRepository = manager.getRepository(RoomStay)

            const stay = await stayRepository.findOne({
                where: { id },
                lock: { mode: 'pessimistic_write' }
            })

            if (!stay) {
                throw new NotFoundException("No stays found")
            }

            if (stay.status !== RoomStayStatus.CHECKED_IN) {
                throw new BadRequestException("This stay has been checked out")
            }

            // Tính toán số đêm lưu trú và tổng số tiền
            const now = new Date()
            const checkIn = new Date(stay.checkInAt)
            
            // Lấy mốc 00:00:00 của mỗi ngày để so sánh ngày lịch, loại bỏ ảnh hưởng của giờ
            const startOfDay = (d: Date) => 
                new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
            
            const diffDays = Math.round((startOfDay(now) - startOfDay(checkIn)) / (24 * 60 * 60 * 1000))

            // Tối thiểu 1 đêm (check-in và check-out cùng ngày vẫn tính 1 đêm)
            const night = Math.max(1, diffDays)

            const amount = night * Number(stay.roomPrice)

            stay.checkOutAt = now
            stay.totalAmount = amount.toFixed(2)
            stay.paymentStatus = RoomStayPaymentStatus.PAID
            stay.paymentMethod = dto.paymentMethod
            stay.paidAt = now
            stay.status = RoomStayStatus.CHECKED_OUT

            const savedStay = await stayRepository.save(stay)

            if (stay.walkInVisitId) {
                await manager.getRepository(WalkInVisit).update(
                    stay.walkInVisitId,
                    { status: "COMPLETED" }
                )
            }

            return savedStay
        })
    }
}
