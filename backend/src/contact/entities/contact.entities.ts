import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("contact_settings")
export class ContactSetting {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: string

    @Column({ type: "varchar", length: 20 })
    hotline: string

    @Column({ type: "varchar", length: 500 })
    zalo: string

    @Column({ type: "varchar", length: 500 })
    messenger: string

    @Column({ type: "varchar", length: 255 })
    email: string

    @Column({ type: "datetime" })
    updated_at: Date

    @Column({ type: 'bigint', nullable: true })
    updated_by: string | null;
}