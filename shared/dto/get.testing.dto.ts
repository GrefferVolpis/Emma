import { ApiProperty } from '@nestjs/swagger';
import {
  Min,
  IsString,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GetRebuildDTO {
  @ApiProperty({
    type: String,
    required: true
  })
  @IsString()
  id: string;

  @ApiProperty({
    type: Number,
    required: true
  })
  @Transform(({ value: line }) => parseInt(line))
  @Min(0)
  @IsNumber()
  line: number;

  @ApiProperty({
    type: Number,
    required: true
  })
  @Transform(({ value: value }) => parseInt(value))
  @IsPositive()
  @IsNumber()
  value: number;

  @ApiProperty({
    type: Number,
    required: true
  })
  @Transform(({ value: retention }) => parseInt(retention))
  @IsPositive()
  @IsNumber()
  retention: number;
}
