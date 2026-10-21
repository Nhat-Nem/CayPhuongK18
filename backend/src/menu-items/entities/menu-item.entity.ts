import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Category } from "../../category/entities/category.entity";

@Entity("menu_items")
export class MenuItem {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: string

    @Column({ type: "varchar", length: 255 })
    name: string

    @Column({ type: "text", nullable: true })
    description: string | null

    @Column({ type: "decimal", precision: 12, scale: 2 })
    price: string

    @Column({ type: "text", nullable: true })
    ingredient: string | null

    @Column({ type: "longtext", nullable: true })
    image: string | null

    @Column({ type: "int", default: 0 })
    sold: number

    @Column({ name: "category_id", type: "bigint" })
    categoryId: string

    @ManyToOne(() => Category, (category) => category.menuItems, { nullable: true, onDelete: "RESTRICT" })
    @JoinColumn({ name: "category_id" })
    category: Category

    @CreateDateColumn({ name: "created_at", type: "datetime" })
    createdAt: Date

    @UpdateDateColumn({ name: "updated_at", type: "datetime" })
    updatedAt: Date
}