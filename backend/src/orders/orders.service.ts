import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { UpdateOrderNoteDto } from './dto/update-order-note.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RecordOrderPaymentDto } from './dto/record-order-payment.dto';
import { DataSource } from 'typeorm';
import { OrdersLogger } from './orders.logger';
import { Promotion, PromotionAppliesTo, PromotionStatus, PromotionType } from '../promotions/entities/promotion.entity';
import { ApplyPromotionDto } from './dto/apply-promotion.dto';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,

        @InjectRepository(OrderItem)
        private readonly orderItemRepository: Repository<OrderItem>,

        @InjectRepository(MenuItem)
        private readonly menuItemRepository: Repository<MenuItem>,

        @InjectRepository(Promotion)
        private readonly promotionRepository: Repository<Promotion>,

        private readonly dataSource: DataSource,

        private readonly ordersLogger: OrdersLogger
    ) {}

    // Lấy thời gian hiện tại
    private getCurrentTime() {
        return new Date().toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh"
        })
    }

    // Tính lại tổng tiền sau khuyến mãi
    private async recalculateTotal(orderId: string) {
        const items = await this.orderItemRepository.find({
            where: { orderId }
        })

        const order = await this.orderRepository.findOneBy({ id: orderId })

        if (!order) {
            throw new NotFoundException(`Cannot find order`)
        }

        // Tiền trước giảm
        const subtotal = items.reduce(
            (sum, item) => sum + Number(item.unitPrice) * item.quantity, 0
        )

        let discount = 0

        if  (order.promotionType && order.promotionValue !== null) {
            if (order.promotionType === PromotionType.PERCENTAGE) {
                discount = subtotal * Number(order.promotionValue) / 100
            } else {
                discount = Number(order.promotionValue)
            }
        }

        // Không cho giảm vượt quá tổng
        discount = Math.max(0, Math.min(discount, subtotal))

        // Làm tròn
        discount = Number(discount.toFixed(2))

        const total = Number((subtotal - discount).toFixed(2))

        await this.orderRepository.update(orderId, {
            discountAmount: discount.toFixed(2),
            totalAmount: total.toFixed(2)
        })
    }

    // Tìm đơn hàng
    async findOne(id: string) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: {items: { menuItem: true }, promotion: true }
        })

        if (!order) {
            throw new NotFoundException("Cannot found order")
        }

        return order
    }

    // Kiểm tra đơn còn được phép chỉnh không
    private async getEditableOrder(id: string) {
        const order = await this.findOne(id)

        if (order.status === OrderStatus.COMPLETED || 
            order.status === OrderStatus.CANCELLED 
        ) {
            throw new BadRequestException(`Completed or cancelled orders cannot be edited`)
        }

        // k cho edit don da thanh toan
        if (order.paymentStatus === PaymentStatus.PAID) {
            throw new BadRequestException("Cannot edit a paid order")
        }

        return order
    }

    // Tạo đơn hàng
    async create(dto: CreateOrderDto) {
        const hasTable = !!dto.tableNumber?.trim()
        const hasRoom = !!dto.roomNumber?.trim()

        if (hasTable === hasRoom) {
            throw new BadRequestException(`You must either table number or room number`)
        }
    
        const order = this.orderRepository.create({
            code: `ORD-${Date.now()}`,
            note: dto.note ?? null,
            tableNumber: hasTable ? dto.tableNumber?.trim() : null,
            roomNumber: hasRoom ? dto.roomNumber?.trim() : null,

            promotionId: null,
            promotionName: null,
            promotionType: null,
            promotionValue: null, 
            discountAmount: '0.00',

            status: OrderStatus.PENDING,
            totalAmount: '0.00'
        }) 

        const result = await this.orderRepository.save(order)

        this.ordersLogger.log(`Create order ID ${result.id} (${result.code}) successfully at ${this.getCurrentTime()}`)

        return result
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

        const result = await this.findOne(orderId)

        this.ordersLogger.log(`Add menu item ID ${dto.menuItemId} to order ID ${orderId} successfully at ${this.getCurrentTime()}`)

        return result
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

        const oldQuantity = item.quantity

        item.quantity = dto.quantity

        await this.orderItemRepository.save(item)
        await this.recalculateTotal(orderId)

        const result = await this.findOne(orderId)

        this.ordersLogger.log(`Update order item ${itemId} quantity from ${oldQuantity} to ${dto.quantity} in order ${orderId} successfully at ${this.getCurrentTime()}`)

        return result
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

        const result = await this.findOne(orderId)

        this.ordersLogger.log(`Remove order item ${itemId} from order ${orderId} successfully at ${this.getCurrentTime()}`)

        return result
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

        const result = await this.findOne(orderId)

        this.ordersLogger.log(`Update note for order ID ${orderId} successfully at ${this.getCurrentTime()}`)

        return result
    }

    // Update đơn
    async update(id: string, dto: UpdateOrderDto) {
        const order = await this.getEditableOrder(id)

        Object.assign(order, dto)

        await this.orderRepository.save(order)

        const result = await this.findOne(id)

        this.ordersLogger.log(`Update order ID ${id} successfullt at ${this.getCurrentTime()}`)

        return result
    }

    // Xem danh sách đơn hàng
    async findAll() {
        return this.orderRepository.find({
            relations: { items: { menuItem: true }, promotion: true },
            order: { createdAt: "DESC" }
        })
    }

    // Cap nhat trang thai
    async updateStatus(id: string, dto: UpdateOrderStatusDto) {
        const order = await this.findOne(id)

        // Neu da hoan thanh hay bi huy k the doi trang thai
        if (
            order.status === OrderStatus.COMPLETED || 
            order.status === OrderStatus.CANCELLED
        ) {
            throw new BadRequestException("Completed or Cancelled orders cannot change status")
        }

        // neu da xac nhan k the quay ve PENDING
        if (dto.status === OrderStatus.PENDING) {
            throw new BadRequestException("Cannot change an order back to PENDING")
        }

        // k cho huy don da thanh toan
        if (
            dto.status === OrderStatus.CANCELLED && 
            order.paymentStatus === PaymentStatus.PAID
        ) {
            throw new BadRequestException("Cannot cancel a paid order")
        }

        // k cho hoan thanh neu chua thanh toan
        if (
            dto.status === OrderStatus.COMPLETED &&
            order.paymentStatus !== PaymentStatus.PAID
        ) {
            throw new BadRequestException("Cannot complete an unpaid order")
        }

        // K cho hoan thanh don rỗng
        if (
            dto.status === OrderStatus.COMPLETED &&
            order.items.length === 0
        ) {
            throw new BadRequestException("Cannot complete an empty order")
        }

        const oldStatus = order.status

        order.status = dto.status

        const result = await this.orderRepository.save(order)

        this.ordersLogger.log(`Update order ID ${id} status from ${oldStatus} to ${dto.status} successfully at ${this.getCurrentTime()}`)

        return result
    }

    // Ghi nhan thanh toan
    async recordPayment(id: string, dto: RecordOrderPaymentDto) {
        const result = await this.dataSource.transaction(async (manager) => {
            const orderRepo = manager.getRepository(Order)

            // Khoa ban ghi order trog xu li
            const order = await orderRepo.findOne({
                where: { id },
                lock: { mode: 'pessimistic_write' }
            })

            if (!order) {
                throw new NotFoundException("Cannot find order")
            }

            if (order.status === OrderStatus.CANCELLED) {
                throw new BadRequestException("Cannot pay for a cancelled order")
            }

            if (order.status !== OrderStatus.CONFIRMED) {
                throw new BadRequestException("Only confirmed orders can be paid")
            }

            if (order.paymentStatus === PaymentStatus.PAID) {
                throw new BadRequestException("This order has already been paid")
            }

            if (Number(order.totalAmount) <= 0) {
                throw new BadRequestException("Cannot record payment for an empty order")
            }

            order.paymentStatus = PaymentStatus.PAID
            order.paymentMethod = dto.paymentMethod
            order.paidAt = new Date()

            return orderRepo.save(order)
        })

        this.ordersLogger.log(`Record payment for order ID ${id} using ${dto.paymentMethod} successfully at ${this.getCurrentTime()}`)

        return result
    }

    async applyPromotion(id: string, dto: ApplyPromotionDto) {
        const order = await this.getEditableOrder(id)

        const promotion = await this.promotionRepository.findOne({
            where: { id: dto.promotionId }
        })

        if (!promotion) {
            throw new NotFoundException("Cannot find promotion")
        }

        // Check status
        if (promotion.status !== PromotionStatus.ACTIVE) {
            throw new BadRequestException("Promotion is not active")
        }

        // Kiem tra thoi han
        const now = new Date()

        if (
            now < new Date(promotion.startDate) || 
            now >= new Date(promotion.endDate)
        ) {
            throw new BadRequestException("Promotion is expered or not started")
        }

        // Loai don hàng
        const appliesTo = order.tableNumber 
            ? PromotionAppliesTo.RESTAURANT
            : PromotionAppliesTo.HOTEL

        if (promotion.appliesTo !== appliesTo) {
            throw new BadRequestException("This promotion cannot be applied to this order")
        }

        // Kiem tra gai tri promotion
        const value = Number(promotion.discountValue)

        if (
            !Number.isFinite(value) || 
            value <= 0 ||
            (promotion.discountType === PromotionType.PERCENTAGE && value > 100)
        ) {
            throw new BadRequestException("Invalid promotion value")
        }

        // Luu thong tin
        order.promotionId = promotion.id
        order.promotionName = promotion.name
        order.promotionType = promotion.discountType
        order.promotionValue = String(promotion.discountValue)
            
        await this.orderRepository.save(order)

        await this.recalculateTotal(id)

        const result = await this.findOne(id)

        this.ordersLogger.log(`Apply promotion ID ${promotion.id} to order ID ${id} successfully at ${this.getCurrentTime()}`)

        return result
    }

    // Bỏ khuyến mãi
    async removePromotion(id: string) {
        const order = await this.getEditableOrder(id)

        if (!order.promotionId && !order.promotionType) {
            throw new BadRequestException("This order has no promotion")
        }

        order.promotionId = null
        order.promotionName = null
        order.promotionType = null
        order.promotionValue = null
        order.discountAmount = "0.00"

        await this.orderRepository.save(order)

        await this.recalculateTotal(id)

        const result = await this.findOne(id)

        this.ordersLogger.log(`Remove promotion order ID ${id} successfully at ${this.getCurrentTime()}`)

        return result
    }

    // Soft Delete
    async remove(id: string) {
        const order = await this.findOne(id)

        if (
            order.status !== OrderStatus.CANCELLED &&
            order.status !== OrderStatus.COMPLETED
        ) {
            throw new BadRequestException("Only completed or cancelled orders can be deleted")
        }

        await this.orderRepository.softDelete(id)

        this.ordersLogger.log(`Soft delete order ID ${id} successfully at ${this.getCurrentTime()}`)

        return {
            message: "Order deleted successfully"
        }
    }
}
