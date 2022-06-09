import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TestingIndicator } from "./TestingIndicator";

@Entity()
export class Testing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false
  })
  profits: number;

  @Column({
    nullable: false
  })
  good_deals: number;

  @Column({
    nullable: false
  })
  bad_deals: number;

  @Column({
    nullable: false
  })
  retention: number;

  @Column({
    default: 0,
    nullable: false
  })
  weight: number;

  @Column('timestamp', {
    default: new Date()
  })
  created: Date;

  @OneToMany((type) => TestingIndicator, (testingIndicator) => testingIndicator.testing, {
    onDelete: 'CASCADE'
  })
  testingIndicator: TestingIndicator[];
}
