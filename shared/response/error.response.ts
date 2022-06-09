import { ApiProperty } from '@nestjs/swagger';

export class Error {
  @ApiProperty({
    description: 'Response message',
    example: 'Щось пішло не так, спробуйте пізніше'
  })
  message: string;

  @ApiProperty({
    description: 'Response error',
    example: 'Помилка сервiсу, спробуйте пiзнiше'
  })
  error: string;
}
