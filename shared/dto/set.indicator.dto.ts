import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsPositive,
  IsArray
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CODE_INDICATOR } from './../../interfaces/enum/code.indicator.enum';
import { TYPE_INDICATOR } from './../../interfaces/enum/type.indicator.enum';

export class SetIndicatorDTO {
  @ApiProperty({
    type: String,
    required: true
  })
  @IsString()
  name: CODE_INDICATOR;

  @ApiProperty({
    type: String,
    required: true
  })
  @IsString()
  type: TYPE_INDICATOR;

  @ApiProperty({
    type: Number,
    required: true
  })
  @Transform(({ value: amount_parameters }) => parseInt(amount_parameters))
  @IsPositive()
  @IsNumber()
  amount_parameters: number;

  @ApiProperty({ type: Array, required: false })
  @IsArray()
  diapason: number[];

  @ApiProperty({ type: Array, required: false })
  @IsArray()
  value: number[];
}
