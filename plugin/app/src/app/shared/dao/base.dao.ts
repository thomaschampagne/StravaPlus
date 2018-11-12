import { Inject } from "@angular/core";
import { DataStore } from "../data-store/data-store";
import { StorageLocationModel } from "../data-store/storage-location.model";

export abstract class BaseDao<T> {

	public defaultStorage: T[] | T;

	public storageLocation: StorageLocationModel = null;

	constructor(@Inject(DataStore) public dataStore: DataStore<T>) {
		this.init();
	}

	public abstract getStorageLocation(): StorageLocationModel;

	public abstract getDefaultStorageValue(): T[] | T;

	public init(): void {
		this.storageLocation = this.getStorageLocation();
		this.defaultStorage = this.getDefaultStorageValue();
	}

	/**
	 * Check if StorageLocationModel is well set
	 */
	public checkCompliantDao(): Promise<void> {
		if (!this.storageLocation) {
			return Promise.reject("StorageLocationModel not set in '" + this.constructor.name + "'. Please override init method to assign a StorageLocationModel.");
		}
		return Promise.resolve();
	}

	/**
	 * Fetch all data
	 */
	public fetch(): Promise<T[] | T> {
		return this.checkCompliantDao().then(() => {
			return this.dataStore.fetch(this.storageLocation, null, this.defaultStorage);
		});
	}

	/**
	 * Save and replace all data
	 * @param value
	 */
	public save(value: T[] | T): Promise<T[] | T> {
		return this.checkCompliantDao().then(() => {
			return this.dataStore.save(this.storageLocation, value, this.defaultStorage);
		});
	}

	/**
	 * Update or insert a specific property of data handled at given path (create path if needed)
	 * @param path key or array of keys to describe the nested path
	 * @param value
	 */
	public upsertProperty<V>(path: string | string[], value: V): Promise<T> {
		return this.checkCompliantDao().then(() => {
			return this.dataStore.upsertProperty<V>(this.storageLocation, path, value, this.defaultStorage);
		});
	}

	/**
	 * Clear all data
	 */
	public clear(): Promise<void> {
		return this.checkCompliantDao().then(() => {
			return this.dataStore.clear(this.storageLocation);
		});
	}
}
