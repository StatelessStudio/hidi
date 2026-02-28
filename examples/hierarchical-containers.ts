/* eslint-disable no-console */

/**
 * Example demonstrating hierarchical containers with service overrides
 *
 * Hierarchical containers enable two key patterns:
 * 1. Container tree mirrors code structure (standard tier, premium tier)
 * 2. Child containers override parent dependencies for their context
 *
 * In this example: A root container provides shared services (Logger),
 * and premium tier overrides the BillingService to provide better discount.
 */

import { DependencyContainer, HasDependencies } from '../src/index';

// Shared service (root level)
class Logger {
	log(message: string): void {
		console.log(`[LOG] ${message}`);
	}
}

// Standard billing service (10% discount)
class BillingService implements HasDependencies {
	protected logger: Logger;

	inject(container: DependencyContainer): void {
		this.logger = container.require(Logger);
	}

	calculateTotal(amount: number): number {
		this.logger.log('BillingService: Calculating standard discount (10%)');
		return amount * 0.9;
	}
}

// Premium billing service (25% discount)
class PremiumBillingService extends BillingService {
	override calculateTotal(amount: number): number {
		this.logger?.log(
			'PremiumBillingService: Calculating premium discount (25%)'
		);
		return amount * 0.75;
	}
}

// Checkout service uses the billing service
class CheckoutService implements HasDependencies {
	protected logger: Logger;
	protected billing: BillingService;

	inject(container: DependencyContainer): void {
		this.logger = container.require(Logger);
		this.billing = container.require(BillingService);
	}

	checkout(amount: number): void {
		this.logger.log('CheckoutService: Starting checkout');
		const total = this.billing.calculateTotal(amount);
		this.logger.log(`CheckoutService: Final amount: $${total.toFixed(2)}`);
	}
}

// Example demonstrating hierarchical container structure
function main(): void {
	console.log('=== Hierarchical Containers with Service Overrides ===\n');

	// Standard tier - root container with base services
	console.log('--- Standard Tier Checkout ---');
	const standardContainer = new DependencyContainer();

	standardContainer.register(Logger);
	standardContainer.register(BillingService);
	standardContainer.register(CheckoutService);

	standardContainer.inject();

	//const ck1 = standardContainer.require(CheckoutService);

	// Premium tier - extends standard but overrides BillingService
	console.log('\n--- Premium Tier Checkout ---');
	const premiumContainer = standardContainer.extend();

	premiumContainer.register(BillingService, PremiumBillingService);
	premiumContainer.inject();

	const ck1 = standardContainer.require(CheckoutService);
	const ck2 = premiumContainer.require(CheckoutService);

	ck1.checkout(100); // Standard tier checkout $90.00
	ck2.checkout(100); // Premium tier checkout $75.00

	console.log(
		'\n✓ Hierarchical containers: Premium tier extends Standard tier,'
	);
	console.log(
		'  CheckoutService automatically resolved with premium BillingService'
	);
}

main();
