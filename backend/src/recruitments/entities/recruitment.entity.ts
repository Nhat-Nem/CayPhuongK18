import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("recruitments")
export class Recruitment {
    @PrimaryGeneratedColumn({ type: "bigint", name: "id" })
    id: string

    @Column({ type: "varchar", length: 255 })
    title: string

    @Column({ type: "text", nullable: true })
    description: string | null

    @Column({ type: "varchar", length: 255, nullable: true })
    position: string | null

    @Column({ type: "int", nullable: true })
    quantity: number | null

    @Column({ type: "varchar", length: 100, nullable: true })
    salary: string | null

    @Column({ name: "employment_type", type: "varchar", length: 50, nullable: true })
    employmentType: string | null

    @Column({ type: "varchar", length: 255, nullable: true })
    location: string | null

    @Column({ type: "text", nullable: true })
    requirements: string | null

    @Column({ type: "text", nullable: true })
    benefits: string | null

    @Column({ type: "datetime", nullable: true })
    deadline: Date | null

    @Column({ type: "varchar", length: 50, default: "ACTIVATE" })
    status: string

    @CreateDateColumn({ name: "created_at", type: "datetime" })
    createdAt: Date

    @UpdateDateColumn({ name: "updated_at", type: "datetime" })
    updatedAt: Date
}
