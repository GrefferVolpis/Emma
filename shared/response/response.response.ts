import { ApiProperty } from '@nestjs/swagger';

export class Response {
  @ApiProperty({
    description: 'Response message',
    example: 'Succesfull response'
  })
  message: string;
}
