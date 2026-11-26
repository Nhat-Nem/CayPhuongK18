import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Repository } from 'typeorm';
import { PaymentStatus } from '../orders/entities/order.entity';
import { RoomStay, RoomStayPaymentStatus } from '../room-stays/entities/room-stay.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(OrderItem)
        private readonly orderItemRepository: Repository<OrderItem>,

        @InjectRepository(RoomStay)
        private readonly roomStayRepository: Repository<RoomStay>
    ) {}

    private getNextDay(date: string): string {
        const nextDay = new Date(`${date}T00:00:00`)
        nextDay.setDate(nextDay.getDate() + 1)

        return [
            nextDay.getFullYear(),
            String(nextDay.getMonth() + 1).padStart(2, '0'),
            String(nextDay.getDate()).padStart(2, '0'),
        ].join("-") + ` 00:00:00`
    }

    // doanh thu mon an
    async getFoodRevenue(from?: string, to?: string) {
        const query = this.orderItemRepository
            .createQueryBuilder('item')
            .withDeleted()
            .innerJoin("item.order", 'order')
            .innerJoin('item.menuItem', 'menuItem')
            .select('menuItem.id', 'menuItemId')
            .addSelect('menuItem.name', 'menuItemName')
            .addSelect('SUM(item.quantity)', 'quantitySold')
            .addSelect('SUM(item.quantity * item.unitPrice)', 'revenue')
            .where('order.paymentStatus = :paymentStatus', { paymentStatus: PaymentStatus.PAID })

        if (from) {
            query.andWhere('order.paidAt >= :from', {
                from: `${from} 00:00:00`
            })
        }

        if (to) {
            query.andWhere('order.paidAt < :to', {
                to: this.getNextDay(to)
            })
        }

        const items = await query
            .groupBy('menuItem.id')
            .addGroupBy('menuItem.name')
            .orderBy("revenue", 'DESC')
            .getRawMany()

        const totalRevenue = items.reduce(
            (sum, item) => sum + Number(item.revenue),
            0,
        )

        return {
            from: from ?? null,
            to: to ?? null,
            totalRevenue: totalRevenue.toFixed(2),
            items: items.map((item) => ({
                menuItemId: item.menuItemId,
                menuItemName: item.menuItemName,
                quantitySold: Number(item.quantitySold),
                revenue: Number(item.revenue).toFixed(2)
            }))
        }
    }

    // Doanh thu khach san
    async getHotelRevenue(from?: string, to?: string) {
        const query = this.roomStayRepository
            .createQueryBuilder('stay')
            .withDeleted()
            .innerJoin('stay.room', 'room')
            .select('room.id', 'roomId')
            .addSelect('room.name', 'roomName')
            .addSelect('COUNT(stay.id)', 'stayCount')
            .addSelect('SUM(stay.totalAmount)', 'revenue')

            // Doanh thu tu khach dat truoc
            .addSelect(
                'SUM(CASE WHEN stay.bookingRequestId IS NOT NULL THEN stay.totalAmount ELSE 0 END)',
                'bookingRevenue'
            )

            // Doanh thu tu khach vang lai
            .addSelect(
                'SUM(CASE WHEN stay.walkInVisitId IS NOT NULL THEN stay.totalAmount ELSE 0 END)',
                'walkInRevenue'
            )

            .where('stay.paymentStatus = :paymentStatus', {
                paymentStatus: RoomStayPaymentStatus.PAID
            })

        if (from) {
            query.andWhere('stay.paidAt >= :from', {
                from: `${from} 00:00:00`
            })
        }

        if (to) {
            query.andWhere('stay.paidAt < :to', {
                to: this.getNextDay(to)
            })
        }

        const items = await query
            .groupBy('room.id')
            .addGroupBy('room.name')
            .orderBy('revenue', 'DESC')
            .getRawMany()

        const totalRevenue = items.reduce(
            (sum, item) => sum + Number(item.revenue), 0
        )

        const totalBookingRevenue = items.reduce(
            (sum, item) => sum + Number(item.bookingRevenue), 0
        )

        const totalWalkInRevenue = items.reduce(
            (sum, item) => sum + Number(item.walkInRevenue), 0
        )

        return {
            from: from ?? null,
            to: to ?? null,

            totalRevenue: totalRevenue.toFixed(2),
            totalBookingRevenue: totalBookingRevenue.toFixed(2),
            totalWalkInRevenue: totalWalkInRevenue.toFixed(2),

            items: items.map((item) => ({
                roomId: item.roomId,
                roomName: item.roomName,
                stayCount: Number(item.stayCount),
                revenue: Number(item.revenue).toFixed(2),
                bookingRevenue: Number(item.bookingRevenue).toFixed(2),
                walkInRevenue: Number(item.walkInRevenue).toFixed(2)
            }))
        }
    }
}
