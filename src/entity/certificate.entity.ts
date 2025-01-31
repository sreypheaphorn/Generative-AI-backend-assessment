import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { UserInfo } from "./user.entity";

@Entity()
export class Certificate {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => UserInfo, (user) => user.certificates)
    user: UserInfo;

    @Column()
    courseName: string;

    @CreateDateColumn()
    createdAt: Date;
}




