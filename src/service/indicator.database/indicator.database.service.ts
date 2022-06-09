import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Indicator } from './../../entity/Indicator';
import { CODE_INDICATOR } from './../../../interfaces/enum/code.indicator.enum';
import { TYPE_INDICATOR } from './../../../interfaces/enum/type.indicator.enum';
import { INDICATOR_REPOSITORY } from './../../constants';

@Injectable()
export class IndicatorDatabaseService {
  /**
   * Constructor IndicatorDatabaseService
   * @param {INDICATOR_REPOSITORY} @Inject('INDICATOR_REPOSITORY') private indicatorRepository
   */
  constructor(
    @Inject(INDICATOR_REPOSITORY)
    private readonly indicatorRepository: Repository<Indicator>
  ) { }
  /**
   * Set indicator
   * @param   {CODE_INDICATOR}  name
   * @param   {TYPE_INDICATOR}  type
   * @param   {number}          amount_parameters
   * @param   {number[]}        diapason
   * @param   {number[]}        value
   * @returns {Promise<false | Indicator>}
   */
  public async setIndicator(
    name: CODE_INDICATOR,
    type: TYPE_INDICATOR,
    amount_parameters: number,
    diapason: number[],
    value: number[]
  ): Promise<false | Indicator> {
    try {
      return this.indicatorRepository
        .save({
          name,
          type,
          amount_parameters,
          diapason,
          value
        });
    } catch (err) {
      console.error('setIndicator: ', err.message);

      return false;
    }
  }
  /**
   * Get indicators
   * @returns {Promise<Indicator[]>}
   */
  public async getIndicators(): Promise<Indicator[]> {
    try {
      return this.indicatorRepository.find();
    } catch (err) {
      console.error('getIndicators: ', err.message);

      return [];
    }
  }
  /**
   * Get indicator by id
   * @param   {uuid} id
   * @returns {Promise<Indicator>}
   */
  public async getIndicatorById(id: string): Promise<Indicator> {
    try {
      return this.indicatorRepository.findOne({ id: id });
    } catch (err) {
      console.error('getIndicator: ', err.message);

      return null;
    }
  }
}
