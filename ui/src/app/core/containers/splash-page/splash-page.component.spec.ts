import { ComponentFixture, TestBed, async, ComponentFixtureAutoDetect} from '@angular/core/testing';
import { RouterTestingModule  } from '@angular/router/testing';
import { NgxsModule, Store, Actions, ofActionDispatched } from '@ngxs/store';
import { of, pipe } from 'rxjs';
import { SplashPageComponent } from './splash-page.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule, MatButtonModule } from '@angular/material';
import { PipesModule } from 'app/shared/pipes';
import { GetUser, LoginSuccess, GetUserPrivileges } from 'app/store/auth/auth.actions';
import { ModelButtonComponent } from '../../components/model-button/model-button.component';
import { doesNotThrow } from 'assert';

describe('Search Page', () => {
	let fixture: ComponentFixture<SplashPageComponent>;
	let store: Store;
	let component: SplashPageComponent;
	let actions$: Observable<any>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				NoopAnimationsModule,
				RouterTestingModule,
				NgxsModule.forRoot(),
				MatCardModule,
				MatButtonModule,
				PipesModule
			],
			declarations: [
				SplashPageComponent,
				ModelButtonComponent
			],
			providers: [{ provide: ComponentFixtureAutoDetect, useValue: true }]
		});

		/* Local Storage Mock START */

		function storageMock() {
			let storage = {};

			return {
				setItem: function(key, value) {
					storage[key] = value || '';
				},
				getItem: function(key) {
					return key in storage ? storage[key] : null;
				},
				removeItem: function(key) {
					delete storage[key];
				},
				get length() {
					return Object.keys(storage).length;
				},
				key: function(i) {
					const keys = Object.keys(storage);
					return keys[i] || null;
				},
				clear: function() {
					storage = {};
				}
			};
		}

		window.localStorage = storageMock();
		/* Local Storage Mock END */

		const initialState = {
			models:
				[
					{
						name: 'Workflows',
						description: 'Information model for document workflow',
						icon: {
							name: 'fa-map-signs',
							color: '#000000'
						},
						'x-meditor': {
							model: 'Models',
							states: [
								{
									source: 'Init',
									target: 'Draft',
									modifiedOn: '2018-08-17T20:27:26.328Z'
								}
							],
							modifiedOn: '2018-08-17T20:27:26.328Z',
							modifiedBy: 'anonymous',
							count: 2,
							countAll: 2
						},
						category: 'Admin'
					},
					{
						name: 'Alerts',
						description: 'Message to notify visitors',
						icon: {
							name: 'fa-warning',
							color: '#ffe119'
						},
						'x-meditor': {
							model: 'Models',
							modifiedOn: '2018-09-13T16:50:19.283Z',
							modifiedBy: 'azasorin',
							states: [
								{
									source: 'Init',
									target: 'Draft',
									modifiedOn: '2018-09-13T16:50:19.283Z'
								}
							],
							count: 2,
							countAll: 5
						},
						category: 'GESDISC'
					}
				],
			auth: {
				loggedIn: false
			}
		};

		fixture = TestBed.createComponent(SplashPageComponent);
		component = fixture.componentInstance;

		Object.defineProperty(component, 'categories$', { writable: true });
		Object.defineProperty(component, 'models$', { writable: true });
		Object.defineProperty(component, 'loggedIn$', { writable: true });
		component.categories$ = of(['Admin', 'GESDISC']);
		component.models$ = of(initialState.models);
		component.loggedIn$ = of(initialState.auth.loggedIn);

		store = TestBed.get(Store);
		actions$ = TestBed.get(Actions);
		store.reset(initialState);

		// spyOn(component, 'loggedIn');

		spyOn(store, 'dispatch').and.callThrough();

		fixture.detectChanges();
	});

	// TODO find a proper way to spy on dispatched actions, code below doesn't seems to be working.

	it('should compile and call loggedIn func on init', () => {
		expect(fixture).toMatchSnapshot();
		const getUser = new GetUserPrivileges();
		console.log(getUser);
    component.loggedIn();
    expect(store.dispatch).toHaveBeenCalledWith([getUser]);
		
		// component.ngOnInit();
		// expect(component.loggedIn).toHaveBeenCalled();
		// component.loggedIn();
		// actions$.pipe(ofActionDispatched(GetUser))
		// 	.subscribe((actions) => {
		// 		console.log(actions);
		// 		expect(actions).toBeTruthy();
		// 		done();
		// 	});
	});
});
