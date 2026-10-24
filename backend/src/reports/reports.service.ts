import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Repository } from 'typeorm';
import { PaymentStatus } from '../orders/entities/order.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(OrderItem)
        private readonly orderItemRepository: Repository<OrderItem>
    ) {}

    private getNextDay(date: string): string {
        const nextDay = new Date(`${date}T00:00:00`)
        nextDay.setDate(nextDay.getDate() + 1)

        return [
            nextDay.getFullYear(),
            String(nextDay.getMonth() + 1).padStart(2, '0'),
            String(nextDay.getDate() + 1).padStart(2, '0'),
        ].join("-") + ` 00:00:00`
    }

    // doanh thu mon an
    async getFoodRevenue(from?: string, to?: string) {
        const query = this.orderItemRepository
            .createQueryBuilder('item')
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
}
