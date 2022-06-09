import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CODE_INDICATOR } from "./../../interfaces/enum/code.indicator.enum";
import { TYPE_INDICATOR } from "./../../interfaces/enum/type.indicator.enum";
import { TestingIndicator } from "./TestingIndicator";

@Entity()
export class Indicator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false
  })
  name: CODE_INDICATOR;

  @Column({
    nullable: false
  })
  type: TYPE_INDICATOR;

  @Column({
    nullable: false
  })
  amount_parameters: number;

  @Column("int", { 
    array: true, 
    nullable: false 
  })
  diapason: number[];

  @Column("int", { 
    array: true, 
    nullable: false 
  })
  value: number[];

  @OneToMany((type) => TestingIndicator, (testingIndicator) => testingIndicator.indicator)
  testingIndicator: TestingIndicator[];
}
