import { Controller, Get, Patch, Delete, Post, Body, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { UpdateOrderNoteDto } from './dto/update-order-note.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RecordOrderPaymentDto } from './dto/record-order-payment.dto';

@Controller('orders')
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService
    ) {}

    // Xem danh sách
    // GET /api/v1/orders
    @Get()
    findAll() {
        return this.ordersService.findAll()
    }

    // Xem chi tiết một đơn hàng theo ID, bao gồm các món trong đơn
    // GET /api/v1/orders/:id
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id)
    }

    //Nhân viên tạo đơn hàng mới cho khách
    // POST /api/v1/orders
    // Body: thông tin ban đầu của đơn hàng, ví dụ ghi chú
    @Post()
    create(@Body() dto: CreateOrderDto) {
        return this.ordersService.create(dto)
    }

    // Thêm một món ăn vào đơn hàng
    // POST /api/v1/orders/:id/items
    // id: ID đơn hàng cần thêm món
    // Body: ID món ăn và số lượng cần gọi
    @Post(':id/items') 
    addItem(
        @Param("id") id: string,
        @Body() dto: AddOrderItemDto
    ) {
        return this.ordersService.addItem(id, dto)
    }

    // Thay đổi số lượng của một món trong đơn hàng
    // PATCH /api/v1/orders/:id/items/:itemId
    // id: ID đơn hàng
    // itemId: ID chi tiết món ăn cần cập nhật
    // Body: số lượng mới của món ăn
    @Patch(':id/items/:itemId')
    updateItem(
        @Param("id") id: string,
        @Param("itemId") itemId: string,
        @Body() dto: UpdateOrderItemDto
    ) {
        return this.ordersService.updateItems(id, itemId, dto)
    }

    // Xóa một món ăn khỏi đơn hàng
    // DELETE /api/v1/orders/:id/items/:itemId
    // id: ID đơn hàng
    // itemId: ID chi tiết món ăn cần xóa
    @Delete(":id/items/:itemId")
    removeItem(
        @Param("id") id: string,
        @Param("itemId") itemId: string,
    ) {
        return this.ordersService.removeItem(id, itemId)
    }

    // Sửa note
    // PATCH /api/v1/orders/:id/note
    // Body: nội dung ghi chú mới
    @Patch(':id/note') 
    updateNote(
        @Param('id') id: string,
        @Body() dto: UpdateOrderNoteDto
    ) {
        return this.ordersService.updateNote(id, dto)
    }

    // Admin Cập nhật thông tin đơn hàng
    // PATCH /api/v1/orders/:id
    // Dự kiến chỉ Admin được phép sử dụng API này
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles("ADMIN")
    update(
        @Param('id') id: string,
        @Body() dto: UpdateOrderDto
    ) {
        return this.ordersService.update(id, dto)
    }

    // PATCH /api/v1/orders/:id/status
    // Update trạng thái đơn hàng
    @Patch(":id/status")
    updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateOrderStatusDto
    ) {
        return this.ordersService.updateStatus(id, dto)
    }

    // PATCH /api/v1/orders/:id/payemnt
    // Cập nhật trnag5 thái thanh toán
    @Patch(":id/payment")
    recordPayment(
        @Param("id") id: string, 
        @Body() dto: RecordOrderPaymentDto 
    ) {
        return this.ordersService.recordPayment(id, dto)
    }
}
