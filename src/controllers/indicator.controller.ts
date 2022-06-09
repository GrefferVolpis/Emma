import {
  Inject,
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseFilters
} from '@nestjs/common';
import {
  ApiResponse,
  ApiBody,
  ApiTags
} from '@nestjs/swagger';
import { IndicatorDatabaseService } from './../service/indicator.database/indicator.database.service';
import { SetIndicatorDTO } from './../../shared/dto/set.indicator.dto';
import { AllExceptionsFilter } from './../../shared/filter/http-exception.filter';
import { Response } from './../../shared/response/response.response';
import { Error } from './../../shared/response/error.response';
import { Indicator } from './../entity/Indicator';

@Controller('api')
export class IndicatorController {
  /**
   * Constructor IndicatorController
   * @param {IndicatorDatabaseService} @Inject('IndicatorDatabaseService') private indicatorDatabaseService
   */
  constructor(
    @Inject(IndicatorDatabaseService)
    private readonly indicatorDatabaseService: IndicatorDatabaseService
  ) { }
  /**
   * Set indicator
   * @param   {CODE_INDICATOR} name
   * @param   {number}         weight
   * @param   {TYPE_INDICATOR} type
   * @param   {number}         amount_parameters
   * @param   {number[]}       diapason
   * @param   {number[]}       value
   * @returns {Promise<boolean>}
   */
  @ApiTags('Indicator')
  @ApiBody({ type: SetIndicatorDTO })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Succesfull save indicator',
    type: Response
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Error',
    type: Error
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error',
    type: Error
  })
  @UseFilters(AllExceptionsFilter)
  @Post('indicator')
  @HttpCode(HttpStatus.CREATED)
  setIndicatorHandler(@Body() body: SetIndicatorDTO): Promise<false | Indicator> {
    return this.indicatorDatabaseService.setIndicator(
      body.name,
      body.type,
      body.amount_parameters,
      body.diapason,
      body.value
    );
  }
}
