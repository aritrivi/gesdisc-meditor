import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import {
  StoreRouterConnectingModule,
  RouterStateSerializer,
} from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

import { DocumentState, ModelState } from './store/ngxs-index'

import { reducers, effects, metaReducers } from './store';
import { SnackBarComponent } from './store/effects/notification.effects';
import { CoreModule } from './core/core.module';
import { ApiModule } from './service/api.module';
import { MaterialModule } from './material';

import { CustomRouterStateSerializer } from './shared/utils';

import { MainComponent } from './core/containers/main/main.component';
import { BASE_PATH } from './service';
import { environment } from '../environments/environment';

import { routes } from './routes';
import { ModelsExistsGuard } from './store/guards/models-exists.guard';
import { SelectedModelExistsGuard } from './store/guards/selected-model-exists.guard';

import * as resolvers from 'app/shared/resolvers/'

const routeResolvers = Object.keys(resolvers).map(key => resolvers[key])	// TODO: remove this and use Object.values (need typescript to support ES2017)

@NgModule({
	imports: [
		CommonModule,
		BrowserModule,
		BrowserAnimationsModule,
		HttpClientModule,
		FlexLayoutModule,
		MaterialModule,
		RouterModule.forRoot(routes, { useHash: true }),

		/**
		 * StoreModule.forRoot is imported once in the root module, accepting a reducer
		 * function or object map of reducer functions. If passed an object of
		 * reducers, combineReducers will be run creating your application
		 * meta-reducer. This returns all providers for an @ngrx/store
		 * based application.
		 */
		StoreModule.forRoot(reducers, { metaReducers }),
		EffectsModule.forRoot(effects),
		/**
		 * @ngrx/router-store keeps router state up-to-date in the store.
		 */
		StoreRouterConnectingModule.forRoot({
			/*
				They stateKey defines the name of the state used by the router-store reducer.
				This matches the key defined in the map of reducers
			*/
			stateKey: 'router',
		}),

		/**
		 * Store devtools instrument the store retaining past versions of state
		 * and recalculating new states. This enables powerful time-travel
		 * debugging.
		 *
		 * To use the debugger, install the Redux Devtools extension for either
		 * Chrome or Firefox
		 *
		 * See: https://github.com/zalmoxisus/redux-devtools-extension
		 */
		StoreDevtoolsModule.instrument({
			name: 'NgRx Meditor Store DevTools',
			logOnly: environment.production,
		}),

		/**
		 * EffectsModule.forRoot() is imported once in the root module and
		 * sets up the effects class to be initialized immediately when the
		 * application starts.
		 *
		 * See: https://github.com/ngrx/platform/blob/master/docs/effects/api.md#forroot
		 */
		CoreModule.forRoot(),
		NgxsModule.forRoot([ DocumentState, ModelState ]),
    	NgxsReduxDevtoolsPluginModule.forRoot(),
		ApiModule
	],
	providers: [
		/**
		 * The `RouterStateSnapshot` provided by the `Router` is a large complex structure.
		 * A custom RouterStateSerializer is used to parse the `RouterStateSnapshot` provided
		 * by `@ngrx/router-store` to include only the desired pieces of the snapshot.
		 */
		{ provide: RouterStateSerializer, useClass: CustomRouterStateSerializer },
		{ provide: BASE_PATH, useValue: environment.API_BASE_PATH },
		ModelsExistsGuard,
		...routeResolvers,
	],
	declarations: [ SnackBarComponent ],
	entryComponents: [ SnackBarComponent ],
	bootstrap: [ MainComponent ],
})
export class AppModule { }
