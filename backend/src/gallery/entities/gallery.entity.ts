import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('gallery_images')
export class GalleryImage {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: string

    @Column({
        name: 'image_base64',
        type: 'longtext',
    })
    imageBase64: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    caption: string | null

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean

    @Column({ name: 'display_order', type: 'int', default: 0 })
    displayOrder: number

    @CreateDateColumn({ name: 'created_at' })
    createAt: Date

    @UpdateDateColumn({ name: 'updated_at' })
    updateAt: Date
}