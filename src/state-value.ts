/**
 * A reactive wrapper for state values that supports pub/sub notifications.
 * When the value is set, all subscribers are notified with the new and old
 * values.
 */
export class StateValue<T> {
	protected _value: T;
	protected subscribers: Set<(newValue: T, oldValue: T) => void> = new Set();

	/**
	 * Creates a new StateValue with an initial value.
	 * @param initialValue The initial value for this state
	 */
	constructor(initialValue: T) {
		this._value = initialValue;
	}

	/**
	 * Gets the current value.
	 */
	get value(): T {
		return this._value;
	}

	/**
	 * Sets the value and notifies all subscribers of the change.
	 * @param newValue The new value to set
	 */
	set value(newValue: T) {
		const oldValue = this._value;
		this._value = newValue;

		// Notify all subscribers
		this.subscribers.forEach((callback) => {
			callback(newValue, oldValue);
		});
	}

	/**
	 * Updates the value using an updater function.
	 * This prevents accidental mutations and enforces immutable patterns.
	 * @param updater Function that receives current value and returns new value
	 */
	update(updater: (current: T) => T): void {
		this.value = updater(this._value);
	}

	/**
	 * Subscribes to value change notifications.
	 * @param callback Function to call when value changes,
	 * receives (newValue, oldValue)
	 * @returns A function to unsubscribe from notifications
	 */
	subscribe(callback: (newValue: T, oldValue: T) => void): () => void {
		this.subscribers.add(callback);

		// Return unsubscribe function
		return () => {
			this.subscribers.delete(callback);
		};
	}
}
