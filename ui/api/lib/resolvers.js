const { GraphQLScalarType } = require('graphql')
const GraphQLJSON = require('graphql-type-json')
const jsonMapper = require('json-mapper-json')

function sortModels(modelA, modelB) {
    if (modelA.category < modelB.category) return 1
    if (modelA.category > modelB.category) return -1

    if (modelA.category < modelB.category) return -1
    if (modelA.category > modelB.category) return 1

    return 0
}

function getDocumentMap(modelName, documentTitle) {
    return {
        'title': {
            path: '$item',
            required: false,
            formatting: (document) => {
                try {
                    return documentTitle || document.title || document.doc.title
                } catch (err) {
                    return ''
                }
            }
        },
        'model': {
            path: 'model',
            required: false,
            formatting: (model) => model || modelName,
        },
        'doc': {
            path: 'doc',
            required: false,
        },
        'modifiedOn': 'x-meditor.modifiedOn',
        'modifiedBy': 'x-meditor.modifiedBy',
        'state': 'x-meditor.state',
        'states': {
            path: 'x-meditor.states',
            required: false,
        },
        'targetStates': 'x-meditor.targetStates',
    }
}

module.exports = {
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue: value => new Date(value),
        serialize: value => new Date(value).getTime(),
        parseLiteral: ast => ast.kind === Kind.INT ? parseInt(ast.value, 10) : null
    }),
    Query: {
        model: async (_, params, { dataSources }) => {
            return dataSources.mEditorApi.getModel(params.modelName)
        },
        models: async (_, _params, { dataSources }) => {
            return dataSources.mEditorApi.getModels()
        },
        modelCategories: async (_, _params, { dataSources }) => {
            let models = (await dataSources.mEditorApi.getModels()).sort(sortModels)

            let categories = models
                // retrieve just the category name
                .map(model => model.category)
                // remove duplicates
                .filter((category, index, categories) => categories.indexOf(category) === index)
            
            return categories.map(category => ({
                name: category,
                models: models
                    .filter(model => model.category === category)
                    .map(model => {
                        model.xMeditor = model['x-meditor']
                        return model
                    })
            }))
        },
        documents: async (_, params, { dataSources }) => {
            let documents = await dataSources.mEditorApi.getDocumentsForModel(params.modelName)
            return await jsonMapper(documents, getDocumentMap(params.modelName))
        },
        document: async (_, params, { dataSources }) => {
            let document = await dataSources.mEditorApi.getDocument(params.modelName, params.title)
            return await jsonMapper(document, getDocumentMap(params.modelName, params.title))
        }
    },
    JSON: GraphQLJSON.GraphQLJSON,
    JSONObject: GraphQLJSON.GraphQLJSONObject,
}
