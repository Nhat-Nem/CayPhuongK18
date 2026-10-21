import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { UpdateOrderNoteDto } from './dto/update-order-note.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,

        @InjectRepository(OrderItem)
        private readonly orderItemRepository: Repository<OrderItem>,

        @InjectRepository(MenuItem)
        private readonly menuItemRepository: Repository<MenuItem>
    ) {}

    // Tìm đơn hàng
    async findOne(id: string) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: {items: { menuItem: true } }
        })

        if (!order) {
            throw new NotFoundException("Cannot found order")
        }

        return order
    }

    // Tính lại tổng tìn6
    private async recalculateTotal(orderId: string) {
        const items = await this.orderItemRepository.find({
            where: { orderId }
        })

        const total = items.reduce(
            (sum, item) => sum += Number(item.unitPrice) * item.quantity, 0
        )

        await this.orderRepository.update(orderId, {
            totalAmount: total.toFixed(2)
        })
    }

    // Kiểm tra đơn còn được phép chỉnh không
    private async getEditableOrder(id: string) {
        const order = await this.findOne(id)

        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException("Only orders pending processing can be edited")
        }

        return order
    }

    // Tạo đơn hàng
    async create(dto: CreateOrderDto) {
        const order = this.orderRepository.create({
            code: `ORD-${Date.now()}`,
            note: dto.note ?? null,
            status: OrderStatus.PENDING,
            totalAmount: '0.00'
        }) 

        return this.orderRepository.save(order)
    }

    // Thêm món vào đơn
    async addItem(orderId: string, dto: AddOrderItemDto) {
        await this.getEditableOrder(orderId)

        const menuItem = await this.menuItemRepository.findOne({
            where: { id: dto.menuItemId }
        })

        if (!menuItem) {
            throw new NotFoundException("Cannot find this menu item id")
        }

        const item = this.orderItemRepository.create({
            orderId,
            menuItemId: dto.menuItemId,
            quantity: dto.quantity,
            unitPrice: String(menuItem.price)
        })

        await this.orderItemRepository.save(item)
        await this.recalculateTotal(orderId)

        return this.findOne(orderId)
    }

    // Thay đổi số lượng
    async updateItems (
        orderId: string,
        itemId: string,
        dto: UpdateOrderItemDto
    ) {
        await this.getEditableOrder(orderId)

        const item = await this.orderItemRepository.findOne({
            where: { id: itemId, orderId }
        })

        if (!item) {
            throw new NotFoundException("Item not found in the order")
        }

        item.quantity = dto.quantity

        await this.orderItemRepository.save(item)
        await this.recalculateTotal(orderId)

        return this.findOne(orderId)
    }

    // Xoa mon khỏi đơn
    async removeItem(orderId: string, itemId: string) {
        await this.getEditableOrder(orderId)

        const item = await this.orderItemRepository.findOne({
            where: { id: itemId, orderId }
        })

        if (!item) {
            throw new NotFoundException("Item not found in the order")
        }

        await this.orderItemRepository.remove(item)
        await this.recalculateTotal(orderId)

        return this.findOne(orderId)
    }

    // Update note
    async updateNote(
        orderId: string,
        dto: UpdateOrderNoteDto
    ) {
        await this.getEditableOrder(orderId)

        await this.orderRepository.update(orderId, {
            note: dto.note ?? null
        })

        return this.findOne(orderId)
    }

    // Update đơn
    async update(id: string, dto: UpdateOrderDto) {
        const order = await this.findOne(id)

        if (
            order.status === OrderStatus.COMPLETED ||
            order.status === OrderStatus.CANCELLED
        ) {
            throw new BadRequestException("Orders that have been completed or cancelled cannot be modified.")
        }

        Object.assign(order, dto)

        await this.orderRepository.save(order)

        return this.findOne(id)
    }

    // Xem danh sách đơn hàng
    async findAll() {
        return this.orderRepository.find({
            relations: { items: { menuItem: true } },
            order: { createdAt: "DESC" }
        })
    }
}
