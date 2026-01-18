import 'jasmine';
import { DependencyContainer } from '../../src';

describe('hidi', () => {
	describe('DependencyContainer', () => {
		let container: DependencyContainer;

		beforeEach(() => {
			container = new DependencyContainer();
		});

		describe('register()', () => {
			it('can register a dependency with an explicit string key', () => {
				const dependency = { service: 'test' };
				container.register('TestService', dependency);

				expect(container.has('TestService')).toBeTrue();
			});

			it('should register with class constructor as key', () => {
				class MyService {
					getValue() {
						return 'test';
					}
				}
				const instance = new MyService();
				container.register(MyService, instance);

				expect(container.has(MyService)).toBeTrue();
			});

			it('should overwrite existing dependency with same key', () => {
				const dep1 = { service: 'first' };
				const dep2 = { service: 'second' };

				container.register('Service', dep1);
				container.register('Service', dep2);

				const result = container.get<{ service: string }>('Service');
				expect(result).toEqual(dep2);
			});
		});

		describe('get()', () => {
			it('should retrieve a dependency by string key', () => {
				const dependency = { value: 'test' };
				container.register('TestService', dependency);

				const result = container.get<{ value: string }>('TestService');
				expect(result).toEqual(dependency);
			});

			it('should retrieve a dependency by injectable object', () => {
				class Service {
					getName() {
						return 'Service';
					}
				}
				const instance = new Service();
				container.register(Service, instance);

				const result = container.get(Service);
				expect(result).toEqual(instance);
			});

			it('should return undefined when dependency not found', () => {
				const result = container.get<{ value: string }>('NonExistent');
				expect(result).toBeUndefined();
			});

			it('should search parent container chain', () => {
				const parentDep = { value: 'parent' };
				container.register('ParentService', parentDep);

				const childContainer = container.extend();
				const result = childContainer.get<{ value: string }>(
					'ParentService'
				);

				expect(result).toEqual(parentDep);
			});

			it('should prefer child dependency over parent', () => {
				const parentDep = { value: 'parent' };
				const childDep = { value: 'child' };

				container.register('Service', parentDep);
				const childContainer = container.extend();
				childContainer.register('Service', childDep);

				const result = childContainer.get<{ value: string }>('Service');
				expect(result).toEqual(childDep);
			});
		});

		describe('require()', () => {
			it('should retrieve a required dependency', () => {
				const dependency = { value: 'test' };
				container.register('RequiredService', dependency);

				const result = container.require<{ value: string }>(
					'RequiredService'
				);
				expect(result).toEqual(dependency);
			});

			it('should throw error when required dependency not found', () => {
				expect(() => {
					container.require('NonExistent');
				}).toThrowError(
					'Required dependency \'NonExistent\' not found in container'
				);
			});

			it('should retrieve from parent container', () => {
				const parentDep = { value: 'parent' };
				container.register('RequiredService', parentDep);

				const childContainer = container.extend();
				const result = childContainer.require<{ value: string }>(
					'RequiredService'
				);

				expect(result).toEqual(parentDep);
			});
		});

		describe('has()', () => {
			it('should return true for existing dependency', () => {
				container.register('Service', { value: 'test' });
				expect(container.has('Service')).toBeTrue();
			});

			it('should return false for non-existing dependency', () => {
				expect(container.has('NonExistent')).toBeFalse();
			});

			it('should check by string key', () => {
				container.register('Service', { value: 'test' });
				expect(container.has('Service')).toBeTrue();
			});

			it('should check by injectable object', () => {
				class Service {
					getName() {
						return 'Service';
					}
				}
				const instance = new Service();
				container.register(Service, instance);

				expect(container.has(Service)).toBeTrue();
			});

			it('should search parent container chain', () => {
				const parentDep = { value: 'parent' };
				container.register('ParentService', parentDep);

				const childContainer = container.extend();
				expect(childContainer.has('ParentService')).toBeTrue();
			});
		});

		describe('extend()', () => {
			it('should create a child container', () => {
				const childContainer = container.extend();
				expect(childContainer).toEqual(
					jasmine.any(DependencyContainer)
				);
			});

			it('should inherit from parent container', () => {
				const parentDep = { value: 'parent' };
				container.register('ParentService', parentDep);

				const childContainer = container.extend();
				const result = childContainer.get<{ value: string }>(
					'ParentService'
				);
				expect(result).toEqual(parentDep);
			});

			it('should allow child to override parent dependencies', () => {
				const parentDep = { value: 'parent' };
				const childDep = { value: 'child' };

				container.register('Service', parentDep);
				const childContainer = container.extend();
				childContainer.register('Service', childDep);

				const childResult = childContainer.get<{ value: string }>(
					'Service'
				);
				const parentResult = container.get<{ value: string }>(
					'Service'
				);
				expect(childResult).toEqual(childDep);
				expect(parentResult).toEqual(parentDep);
			});

			it('should not affect parent when adding to child', () => {
				const childDep = { value: 'child' };
				const childContainer = container.extend();
				childContainer.register('ChildService', childDep);

				expect(container.has('ChildService')).toBeFalse();
				expect(childContainer.has('ChildService')).toBeTrue();
			});

			it('should support multiple levels of nesting', () => {
				const level1Dep = { value: 'level1' };
				const level2Dep = { value: 'level2' };
				const level3Dep = { value: 'level3' };

				container.register('Service1', level1Dep);
				const level2 = container.extend();
				level2.register('Service2', level2Dep);
				const level3 = level2.extend();
				level3.register('Service3', level3Dep);

				const s1 = level3.get<{ value: string }>('Service1');
				const s2 = level3.get<{ value: string }>('Service2');
				const s3 = level3.get<{ value: string }>('Service3');
				expect(s1).toEqual(level1Dep);
				expect(s2).toEqual(level2Dep);
				expect(s3).toEqual(level3Dep);
				expect(level2.has('Service3')).toBeFalse();
			});
		});

		describe('getInjectableKey()', () => {
			it('should return string keys as-is', () => {
				const key = container.getInjectableKey('MyKey');
				expect(key).toBe('MyKey');
			});

			it('should use class constructor name for classes', () => {
				class MyService {}
				const key = container.getInjectableKey(MyService);
				expect(key).toBe('MyService');
			});

			it('throws error for invalid injectable', () => {
				/* eslint-disable @typescript-eslint/no-explicit-any */
				expect(() => {
					container.getInjectableKey(42 as any);
				}).toThrowError('Cannot get key for injectable.');
				/* eslint-enable @typescript-eslint/no-explicit-any */
			});

			it('throws error for unkeyed injectable', () => {
				expect(() => {
					container.getInjectableKey('');
				}).toThrowError('Cannot get key for injectable.');
			});
		});

		describe('setParent()', () => {
			it('should set the parent container', () => {
				const parentContainer = new DependencyContainer();
				const childContainer = new DependencyContainer();

				childContainer.setParent(parentContainer);

				const parentDep = { value: 'parent' };
				parentContainer.register('ParentService', parentDep);

				const result = childContainer.get<{ value: string }>(
					'ParentService'
				);
				expect(result).toEqual(parentDep);
			});

			it('should allow changing parent container', () => {
				const parent1 = new DependencyContainer();
				const parent2 = new DependencyContainer();
				const child = new DependencyContainer();

				const dep1 = { value: 'parent1' };
				const dep2 = { value: 'parent2' };

				parent1.register('Service', dep1);
				parent2.register('Service', dep2);

				child.setParent(parent1);
				const result1 = child.get<{ value: string }>('Service');
				expect(result1).toEqual(dep1);

				child.setParent(parent2);
				const result2 = child.get<{ value: string }>('Service');
				expect(result2).toEqual(dep2);
			});
		});

		describe('Extended Dependencies (Inheritance)', () => {
			it('should register extended class with string key', () => {
				class Logger {
					log(msg: string) {
						return msg;
					}
				}

				class AppLogger extends Logger {
					override log(msg: string) {
						return `[APP] ${msg}`;
					}
				}

				const logger = new AppLogger();
				container.register('Logger', logger);

				const result = container.get<Logger>('Logger');
				expect(result).toEqual(logger);
				expect(result?.log('test')).toBe('[APP] test');
			});

			it(
				'should support multiple implementations with ' +
					'different keys',
				() => {
					class Transport {
						send(data: string) {
							return data;
						}
					}

					class HttpTransport extends Transport {
						override send(data: string) {
							return `HTTP: ${data}`;
						}
					}

					class WebSocketTransport extends Transport {
						override send(data: string) {
							return `WS: ${data}`;
						}
					}

					const httpTransport = new HttpTransport();
					const wsTransport = new WebSocketTransport();

					container.register('HttpTransport', httpTransport);
					container.register('WebSocketTransport', wsTransport);

					const http = container.get<HttpTransport>('HttpTransport');
					const ws =
						container.get<WebSocketTransport>('WebSocketTransport');

					expect(http?.send('data')).toBe('HTTP: data');
					expect(ws?.send('data')).toBe('WS: data');
				}
			);

			it(
				'should maintain instance type through container ' +
					'hierarchy',
				() => {
					class Logger {
						log(msg: string) {
							return msg;
						}
					}

					class FileLogger extends Logger {
						override log(msg: string) {
							return `[FILE] ${msg}`;
						}
					}

					const logger = new FileLogger();
					container.register('Logger', logger);

					const childContainer = container.extend();

					const parentResult = container.get<Logger>('Logger');
					const childResult = childContainer.get<Logger>('Logger');

					expect(parentResult).toEqual(logger);
					expect(childResult).toEqual(logger);
					expect(parentResult?.log('test')).toBe('[FILE] test');
					expect(childResult?.log('test')).toBe('[FILE] test');
				}
			);

			it(
				'should allow override in child container with ' +
					'different subclass',
				() => {
					class Repository {
						getData() {
							return 'data';
						}
					}

					class DatabaseRepository extends Repository {
						override getData() {
							return 'db-data';
						}
					}

					class MockRepository extends Repository {
						override getData() {
							return 'mock-data';
						}
					}

					const dbRepo = new DatabaseRepository();
					container.register('Repository', dbRepo);

					const testContainer = container.extend();
					const mockRepo = new MockRepository();
					testContainer.register('Repository', mockRepo);

					const parentRepo = container.get<Repository>('Repository');
					const testRepo =
						testContainer.get<Repository>('Repository');

					expect(parentRepo?.getData()).toBe('db-data');
					expect(testRepo?.getData()).toBe('mock-data');
				}
			);

			it('should support deep inheritance chains', () => {
				class Base {
					level = 0;
				}

				class Level1 extends Base {
					override level: number = 1;
				}

				class Level2 extends Level1 {
					override level: number = 2;
				}

				class Level3 extends Level2 {
					override level: number = 3;
				}

				const instance = new Level3();
				container.register('Service', instance);

				const result = container.get<Base>('Service');
				expect(result).toEqual(instance);
				expect(result!.level).toBe(3);
			});

			it(
				'should allow registering base and extended versions ' +
					'separately',
				() => {
					class Service {
						type = 'base';
					}

					class ServiceV2 extends Service {
						override type: string = 'v2';
						newMethod() {
							return 'new';
						}
					}

					const serviceV1 = new Service();
					const serviceV2 = new ServiceV2();

					container.register('ServiceV1', serviceV1);
					container.register('ServiceV2', serviceV2);

					const v1 = container.get<Service>('ServiceV1');
					const v2 = container.get<ServiceV2>('ServiceV2');

					expect(v1?.type).toBe('base');
					expect(v2?.type).toBe('v2');
					expect(v2?.newMethod()).toBe('new');
				}
			);

			it('should support checking inheritance with has()', () => {
				class Entity {
					id = 0;
				}

				class User extends Entity {
					name = 'User';
				}

				const user = new User();
				container.register('User', user);

				expect(container.has('User')).toBeTrue();
				expect(container.has('Entity')).toBeFalse();
			});

			it('should allow polymorphic behavior with inheritance', () => {
				class Animal {
					speak() {
						return 'sound';
					}
				}

				class Dog extends Animal {
					override speak() {
						return 'woof';
					}
				}

				class Cat extends Animal {
					override speak() {
						return 'meow';
					}
				}

				const dog = new Dog();
				const cat = new Cat();

				container.register('Dog', dog);
				container.register('Cat', cat);

				const sounds: string[] = [];
				sounds.push(container.require<Dog>('Dog').speak());
				sounds.push(container.require<Cat>('Cat').speak());

				expect(sounds).toEqual(['woof', 'meow']);
			});
		});

		describe('Get by Class Type', () => {
			it('should inject and get by class type', () => {
				class Logger {
					log(msg: string) {
						return msg;
					}
				}

				const logger = new Logger();
				container.register(Logger, logger);

				const retrieved = container.get(Logger);
				expect(retrieved).toEqual(logger);
				expect(retrieved?.log('test')).toBe('test');
			});

			it('can retrieve subclass by parent class key', () => {
				class Log {
					write(msg: string) {
						return msg;
					}
				}

				class AppLog extends Log {
					override write(msg: string) {
						return `[APP] ${msg}`;
					}
				}

				const appLog = new AppLog();
				container.register(Log, appLog);

				const retrieved = container.get(Log);
				expect(retrieved).toEqual(appLog);
				expect(retrieved?.write('test')).toBe('[APP] test');
			});

			it('should require by class type', () => {
				class Service {
					getName() {
						return 'Service';
					}
				}

				const service = new Service();
				container.register(Service, service);

				const retrieved = container.require(Service);
				expect(retrieved).toEqual(service);
				expect(retrieved.getName()).toBe('Service');
			});

			it('should throw when requiring non-existent class type', () => {
				class NotRegistered {
					test() {
						return 'test';
					}
				}

				expect(() => {
					container.require(NotRegistered);
				}).toThrowError(
					'Required dependency \'NotRegistered\' not found ' +
						'in container'
				);
			});

			it('should check existence with has() using class type', () => {
				class MyService {
					name = 'MyService';
				}

				const service = new MyService();
				container.register(MyService, service);

				expect(container.has(MyService)).toBeTrue();
			});

			it(
				'should return false from has() for non-registered ' + 'class',
				() => {
					class NotRegistered {
						test() {
							return 'test';
						}
					}

					expect(container.has(NotRegistered)).toBeFalse();
				}
			);

			it('should support multiple class types as keys', () => {
				class Transport {
					send(data: string) {
						return data;
					}
				}

				class HttpTransport extends Transport {
					override send(data: string) {
						return `HTTP: ${data}`;
					}
				}

				class WebSocketTransport extends Transport {
					override send(data: string) {
						return `WS: ${data}`;
					}
				}

				const httpTransport = new HttpTransport();
				const wsTransport = new WebSocketTransport();

				container.register(HttpTransport, httpTransport);
				container.register(WebSocketTransport, wsTransport);

				const http = container.get(HttpTransport);
				const ws = container.get(WebSocketTransport);

				expect(http?.send('data')).toBe('HTTP: data');
				expect(ws?.send('data')).toBe('WS: data');
			});

			it('should retrieve class type from parent container', () => {
				class Repository {
					query() {
						return 'data';
					}
				}

				const repo = new Repository();
				container.register(Repository, repo);

				const child = container.extend();

				const parentRetrieved = container.get(Repository);
				const childRetrieved = child.get(Repository);

				expect(parentRetrieved).toEqual(repo);
				expect(childRetrieved).toEqual(repo);
			});

			it('should allow child override of parent class type', () => {
				class Logger {
					log(msg: string) {
						return msg;
					}
				}

				const parentLogger = new Logger();
				container.register(Logger, parentLogger);

				const child = container.extend();
				const childLogger = new Logger();
				child.register(Logger, childLogger);

				expect(container.get(Logger)).toEqual(parentLogger);
				expect(child.get(Logger)).toEqual(childLogger);
			});

			it('should work with deep inheritance using class types', () => {
				class Animal {
					sound() {
						return 'sound';
					}
				}

				class Dog extends Animal {
					override sound() {
						return 'woof';
					}
				}

				class ServiceDog extends Dog {
					override sound() {
						return 'service-woof';
					}
				}

				const serviceDog = new ServiceDog();
				container.register(ServiceDog, serviceDog);

				const retrieved = container.get(ServiceDog);
				expect(retrieved?.sound()).toBe('service-woof');
			});

			it('should support mixing string keys and class types', () => {
				class Logger {
					log(msg: string) {
						return msg;
					}
				}

				const logger1 = new Logger();
				container.register('Logger', logger1);

				const logger2 = new Logger();
				container.register(Logger, logger2);

				// Both keys should work
				const byString = container.get<Logger>('Logger');
				const byClass = container.get<Logger>(Logger);
				expect(byString).toEqual(logger1);
				expect(byClass).toEqual(logger2);
			});
		});
	});
});
