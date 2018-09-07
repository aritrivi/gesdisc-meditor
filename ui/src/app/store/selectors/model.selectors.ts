import { createSelector, createFeatureSelector } from '@ngrx/store';

import * as fromModel from '../reducers/model.reducer';

export const getModelState = createFeatureSelector<fromModel.State>('models');

export const getModelIds = createSelector(
	getModelState,
	fromModel.selectModelIds
);

export const getModelEntities = createSelector(
	getModelState,
	fromModel.selectModelEntities
);

export const getAllModels = createSelector(
	getModelState,
	fromModel.selectAllModels
);
export const getResultsTotal = createSelector(
	getModelState,
	fromModel.selectModelsTotal
);
export const getCurrentModelId = createSelector(
  getModelState,
  fromModel.getSelectedId
);

export const getCurrentModel= createSelector(
  getModelState,
  fromModel.getSelectedModel
);

export const getModelsLoaded = createSelector(
  getModelState,
  fromModel.getLoadedModels
);

export const getModelsLoading = createSelector(
  getModelState,
  fromModel.getLoadingModels
);

export const getSelectedModelLoaded = createSelector(
  getModelState,
  fromModel.getSelectedModelLoaded
);

export const getCategories = createSelector(
	getAllModels,
	(allModels) => {
		let allCategories = allModels.map(m => m.category);
		return [...Array.from(new Set(allCategories))]
	}
)

export const selectCurrentModel = createSelector(
	getModelEntities,
	getCurrentModelId,
	(modelEntities, modelId) => modelEntities[modelId]
);