import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Testing } from "./Testing";
import { Indicator } from "./Indicator";

@Entity()
export class TestingIndicator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(type => Testing, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "testing_id", referencedColumnName: "id" })
  testing: Testing;

  @ManyToOne(type => Indicator)
  @JoinColumn({ name: "indicator_id", referencedColumnName: "id" })
  indicator: Indicator;

  @Column({
    default: 0,
    nullable: false
  })
  weight: number;

  @Column("int", { 
    array: true, 
    nullable: false 
  })
  value: number[];
}
