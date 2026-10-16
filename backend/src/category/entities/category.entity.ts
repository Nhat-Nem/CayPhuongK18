import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { MenuItem } from "../../menu-items/entities/menu-item.entity";

@Entity("category")
export class Category {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: string

    @Column({ type: "varchar", length: 255 })
    name: string

    @Column({ type: "varchar", nullable: true })
    description: string | null

    @OneToMany(() => MenuItem, (menuItem) => menuItem.category)
    menuItems: MenuItem[]
}