import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Testing } from './../../entity/Testing';
import { Indicator } from './../../entity/Indicator';
import { TestingIndicator } from './../../entity/TestingIndicator';
import { TESTING_INDICATOR_REPOSITORY } from './../../constants';

@Injectable()
export class TestingIndicatorDatabaseService {
  /**
   * Constructor TestingIndicatorDatabaseService
   * @param {TESTING_INDICATOR_REPOSITORY} @Inject('TESTING_INDICATOR_REPOSITORY') private testingIndicatorRepository
   */
  constructor(
    @Inject(TESTING_INDICATOR_REPOSITORY)
    private readonly testingIndicatorRepository: Repository<TestingIndicator>
  ) { }
  /**
   * Set testing indicator
   * @param   {number[]}  value
   * @param   {number}    weight
   * @param   {Testing}   testing
   * @param   {Indicator} indicator
   * @returns {Promise<false | TestingIndicator>}
   */
  public async setTestingIndicator(
    value: number[],
    weight: number,
    testing: Testing,
    indicator: Indicator
  ): Promise<false | TestingIndicator> {
    try {
      if (
        weight > 0 &&
        testing &&
        indicator &&
        Array.isArray(value) &&
        value.length > 0
      ) {
        const testing_indicator: TestingIndicator = this.testingIndicatorRepository
          .create({
            value,
            weight,
            testing,
            indicator
          })

        return this.testingIndicatorRepository.save(testing_indicator);
      } else {
        throw Error('parameter is null');
      }
    } catch (err) {
      console.error('setTestingIndicator: ', err.message);

      return false;
    }
  }
  /**
   * Get testing indicator by id
   * @param   {string} id
   * @returns {Promise<TestingIndicator[]>}
   */
  public async getTestingIndicatorById(id: string) {
    try {
      return this.testingIndicatorRepository.find({
        relations: ['indicator', 'testing'],
        where: { testing: { id: id } }
      });
    } catch (err) {
      console.error('getTestingIndicatorById: ', err.message);

      return null;
    }
  }
}
