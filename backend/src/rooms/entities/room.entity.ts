import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('rooms')
export class Room {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number;

    @Column({ type: "varchar", length: 50, unique: true })
    code: string

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

    @Column({ name: 'secondary_image', nullable: true })
    secondaryImage: string
}