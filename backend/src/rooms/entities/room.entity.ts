import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('rooms')
export class Room {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column()
    name: string

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    price: number

    @Column()
    status: string

    @Column()
    capacity: number

    @Column({ nullable: true })
    image: string
}