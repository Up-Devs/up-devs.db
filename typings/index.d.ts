declare module "up-devs.db" {
  	import * as Mongoose from "mongoose";
	import { EventEmitter } from "events";

	export interface Events {
		debug: [string];
		error: [UpError];
		ready: [];
	}

	export class UpError extends Error {
		message: string;
		name: string;

		constructor(message: string, name?: string);
	}

	export class MongoBase extends EventEmitter {
		public dbURL: string;
		public options: Mongoose.ConnectionOptions;
		public readyAt: Date;
		public connection: Mongoose.Connection;

		constructor(mongodbURL: string, connectionOptions?: Mongoose.ConnectionOptions);

		private _create(url?: string): Promise<Mongoose.Connection>;
		private _destroyDatabase(): Promise<void>;
		public get url(): string;
		public get state(): "CONNECTED" | "CONNECTING" | "DISCONNECTED" | "DISCONNECTING";

		public on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this;
		public on<S extends string | symbol>(event: Exclude<S, keyof Events>, listener: (...args: any[]) => void): this;

		public once<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this;
		public once<S extends string | symbol>(event: Exclude<S, keyof Events>, listener: (...args: any[]) => void): this;

		public emit<K extends keyof Events>(event: K, ...args: Events[K]): boolean;
		public emit<S extends string | symbol>(event: Exclude<S, keyof Events>, ...args: any[]): boolean;

		public off<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): this;
		public off<S extends string | symbol>(event: Exclude<S, keyof Events>,listener: (...args: any[]) => void): this;

		public removeAllListeners<K extends keyof Events>(event?: K): this;
		public removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof Events>): this;
	}

	export interface DatabaseLatency {
		read: number;
		write: number;
		average: number;
	}

	export interface UtilSort {
		sort?: string;
		limit?: number;
	}

	export interface UtilKey {
		key?: string;
		target?: string;
	}

	export interface DataSet {
		ID: string;
		data: any;
	}

	export interface MongoDBOptions {
		consoleEvents?: boolean;
	}

	export interface JsonDBOptions {
		consoleEvents?: boolean;
	}

	export type MathOps = | "add" | "+" | "subtract" | "sub" | "-" | "multiply" | "mul" | "*" | "divide" | "div" | "/" | "mod" | "%";

	export type ModelReturn = Mongoose.Model<Mongoose.Document>;

	export class MongoDB extends MongoBase {
		public schema: ModelReturn;
		public name: string;

		constructor(mongodbURL?: string, name?: string, options?: MongoDBOptions);
		public set(key: string, value: any): Promise<any>;
		public delete(key: string): Promise<boolean>;
		public exists(key: string): Promise<boolean>;
		public has(key: string): Promise<boolean>;
		public get(key: string): Promise<any>;
		public fetch(key: string): Promise<any>;
		public all(limit?: number): Promise<DataSet[]>;
		public fetchAll(limit?: number): Promise<DataSet[]>;
		public deleteAll(): Promise<true>;
		public math(key: string, operator: MathOps, value: number): Promise<any>;
		public add(key: string, value: number): Promise<any>;
		public subtract(key: string, value: number): Promise<any>;
		public export(fileName?: string, path?: string): Promise<string>;
		public import(data?: DataSet[], ops?: { unique?: boolean, validate?: boolean }): Promise<boolean>;
		public disconnect(): Promise<void>;
		public connect(url: string): Promise<void>;
		private _read(): Promise<number>;
		private _write(): Promise<number>;
		public fetchLatency(): Promise<DatabaseLatency>;
		public ping(): Promise<DatabaseLatency>;
		public startsWith(key: string, ops?: UtilSort): Promise<DataSet[]>;
		public type(key: string): Promise<any>;
		public keyArray(): Promise<string[]>;
		public valueArray(): Promise<any[]>;
		public push(key: string, value: any | any[]): Promise<any>;
		public pull(key: string, value: any | any[], multiple?: boolean): Promise<any>;
		public entries(): Promise<number>;
		public random(limit?: number): Promise<DataSet[]>;
		public table(name: string): MongoDB;
		public createModel(name: string): MongoDB;
		public exportToQuickDB(): Promise<DataSet[]>;
		public updateModel(name: string): ModelReturn;
		public toString(): string;
		public _eval(code: string): any;
		public get uptime(): number;
	}

	export class JsonDB extends EventEmitter {
        constructor(name?: string, options?: JsonDBOptions);

		public set(key: string, value: any): DBData;
		public get(key: string): DBData;
		public fetch(key: string): DBData;
		public exists(key: string): boolean;
		public has(key: string): boolean;
		public all(limit?: number): DBData[];
		public fetchAll(limit?: number): Promise<DBData[]>;
		public toJSON(limit?: number): Object;
		public delete(key: string): JsonDB;
		public deleteAll(): void;
		public type(key: string): any;
		public push(key: string, value: any): DBData;
		public pull(key: string, value: any, multiple?: boolean): DBData;
		public valueArray(): any[];
		public keyArray(): string[];
		public math(key: string, operator: MathOps, value: number): Promise<any>;
		public add(key: string, value: number|string): any;
		public subtract(key: string, value: number|string): any;
		public includes(keywords: string): DBData[]; 
		public startsWith(keywords: string): DBData[];
		public filter(filter: Function): Array<any> | DBData[]; 
		public sort(sort: Function): DBData[];
		public destroy(): void;
		public exportToQuickDB(QuickDB: any): void;
		public _eval(code: string): any;
	}

	export class Util {
		static isKey(str: any): boolean;
		static isValue(data: any): boolean;
		static emit(eventType: string, message: string, database: JsonDB | MongoDB): void;
		static consoleEvent(eventType: string, message: string, database: JsonDB | MongoDB): void;
		static parseKey(key: string): UtilKey;
		static sort(key: string, data: any[], ops?: UtilSort): any[];
		static setData(key: string, data: any, value: any): any;
		static unsetData(key: string, data: any): any;
		static getData(key: string, data: any): any;
	}

	export class DBData {
		public ID: string;
		public data: any;

		constructor(database: JsonDB | MongoDB, connectionOptions?: Mongoose.ConnectionOptions);
	}

	export class Coloful {
		public colorfulText: string;

		public toString(): string;
	}

	export function Schema(connection: Mongoose.Connection, name: string): Mongoose.Schema;

	export const version: string;
}
