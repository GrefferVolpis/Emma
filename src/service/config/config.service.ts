import { Injectable } from '@nestjs/common';
import { parse } from 'dotenv';
import { readFileSync } from 'fs';
import { IConfig } from './../../../interfaces/config.interface';

@Injectable()
export class ConfigService {
	private readonly envConfig: IConfig;
	/**
	 * Constructor ConfigService
	 * @param {string} filePath
	 */
	constructor(filePath: string) {
		this.envConfig = parse(readFileSync(filePath)) as any;
	}
	/**
	 * Get
	 * @param   {IConfig} key
	 * @returns {string}
	 */
	get(key: keyof IConfig): string {
		return this.envConfig[key];
	}
}
