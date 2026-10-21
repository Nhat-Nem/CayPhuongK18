import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";
import { MenuItem } from "../../menu-items/entities/menu-item.entity";

@Entity("order_items")
export class OrderItem {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: string

    @Column({ name: "order_id", type: "bigint" })
    orderId: string

    @Column({ name: "menu_item_id", type: "bigint" })
    menuItemId: string

    @Column({ type: "int" })
    quantity: number

    @Column({ name: "unit_price", type: "decimal", precision: 12, scale: 2 })
    unitPrice: string

    @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
    @JoinColumn({ name: "order_id" })
    order: Order

    @ManyToOne(() => MenuItem, { onDelete: "RESTRICT" })
    @JoinColumn({ name: "menu_item_id" })
    menuItem: MenuItem

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date
}