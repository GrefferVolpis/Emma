import { Injectable, Inject } from '@nestjs/common';
import {
  Repository,
  InsertResult,
  DeleteResult
} from 'typeorm';
import { Testing } from './../../entity/Testing';
import { TESTING_REPOSITORY } from './../../constants';

@Injectable()
export class TestingDatabaseService {
  /**
   * Constructor TestingDatabaseService
   * @param {TESTING_REPOSITORY} @Inject('TESTING_REPOSITORY') private testingRepository
   */
  constructor(
    @Inject(TESTING_REPOSITORY)
    private readonly testingRepository: Repository<Testing>
  ) { }
  /**
   * Set testing
   * @param   {number} weight
   * @param   {number} profits
   * @param   {number} retention
   * @param   {number} bad_deals
   * @param   {number} good_deals
   * @returns {Promise<boolean>}
   */
  public async setTesting(
    weight: number,
    profits: number,
    retention: number,
    bad_deals: number,
    good_deals: number
  ): Promise<InsertResult> {
    try {
      if (weight > 0 && retention > 0) {
        return this.testingRepository.createQueryBuilder()
          .insert()
          .values({
            weight: weight,
            profits: profits,
            retention: retention,
            bad_deals: bad_deals,
            good_deals: good_deals
          })
          .returning('id')
          .execute();
      } else {
        throw Error('weight < 0 or retention < 0');
      }
    } catch (err) {
      console.error('setTesting: ', err.message);

      return null;
    }
  }
  /**
   * Get testing
   * @param   {uuid} id
   * @returns {Promise<Testing>}
   */
  public async getTestingById(
    id: string
  ): Promise<Testing> {
    try {
      return this.testingRepository.findOne({ id });
    } catch (err) {
      console.error('getTestingById: ', err.message);

      return null;
    }
  }
  /**
   * Get testings
   * @returns {Promise<Testing[]>}
   */
  public async getTestings(): Promise<Testing[]> {
    try {
      return this.testingRepository.find({
        order: { profits: 'DESC' }
      });
    } catch (err) {
      console.error('getTestings: ', err.message);

      return null;
    }
  }
  /**
   * Delete testing attempts by id
   * @param   {string} id
   * @returns {Promise<DeleteResult>}
   */
  public async deleteTestingById(id: string): Promise<DeleteResult> {
    try {
      return this.testingRepository.delete({ id: id });
    } catch (err) {
      console.error('deleteTestingById: ', err.message);

      return null;
    }
  }
  /**
   * Delete testings
   * @param   {Testing[]} testings
   * @returns {Promise<Testing[]>}
   */
  public async deleteTestings(testings: Testing[]): Promise<Testing[]> {
    try {
      return this.testingRepository.remove(testings);
    } catch (err) {
      console.error('deleteTestings: ', err.message);

      return null;
    }
  }
}
