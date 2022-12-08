import cloneDeep from 'lodash.clonedeep'
import type { ErrorData } from '../declarations'
import type { Model, PopulatedTemplate, Template } from '../models/types'
import { ErrorCode, HttpException } from '../utils/errors'
import { getMacrosDb } from './db'

const macros = new Map<
    string,
    (...args: any[]) => Promise<ErrorData<PopulatedTemplate['result']>>
>()

async function runModelTemplates(model: Model): Promise<PopulatedTemplate[]> {
    if (!model.hasOwnProperty('templates')) {
        return []
    }

    const templates: Model['templates'] = cloneDeep(model.templates)

    const populatedTemplates = await Promise.all(
        templates.map(async (template: Template & { result: any }) => {
            const [macroName, macroArgument] = template.macro.split(/\s+/)
            const macroService = macros.get(macroName)

            if (!macroService) {
                throw new HttpException(
                    ErrorCode.BadRequest,
                    `Macro, ${macroName}, not supported.`
                )
            }

            const [error, filledTemplate] = await macroService(macroArgument)

            if (error) {
                throw new HttpException(
                    ErrorCode.InternalServerError,
                    `Template macro ${macroName} did not run.`
                )
            }

            template.result = filledTemplate

            return template
        })
    )

    return populatedTemplates
}

async function listDependenciesByTitle(
    macroArgument: string
): Promise<ErrorData<PopulatedTemplate['result']>> {
    try {
        const macrosDb = await getMacrosDb()
        const [modelNameEncoded, dependentFieldEncoded, targetField] =
            macroArgument.split('.')
        const modelName = decodeURIComponent(modelNameEncoded)
        //* Remove brackets if this is an array field; used in DB query and final result.
        const dependentField = dependentFieldEncoded.replace(/\[\]$/, '')

        const results = await macrosDb.getDependenciesByTitle(
            dependentField,
            modelName
        )

        //* Turn the list of results into a JSON Schema dependencies tree.
        const dependencies = {
            [modelName]: {
                oneOf: results
                    //* Filter out invalid results.
                    .filter(result => typeof result.title !== 'undefined')
                    .map(result => ({
                        properties: {
                            [modelName]: {
                                enum: [result.title],
                            },
                            [targetField]: {
                                enum: result[dependentField],
                            },
                        },
                    })),
            },
        }

        return [null, dependencies]
    } catch (error) {
        return [error, null]
    }
}

async function listUniqueFieldValues(
    macroArgument: string
): Promise<ErrorData<PopulatedTemplate['result']>> {
    try {
        const macrosDb = await getMacrosDb()
        //* macroArgument looks like "Keywords.title" or "Collection%20Metadata.Combined_EntryID".
        const [encodedModelName, fieldName] = macroArgument.split('.')
        //* Model names stored as macros appear to be URL-component encoded. If that changes in the future, there is no harm in decoding an already-decoded string.
        const modelName = decodeURIComponent(encodedModelName)
        //! The fieldName must always be the titleProperty (see macro ReadMe).
        const results = await macrosDb.getUniqueFieldValues(fieldName, modelName)

        return [null, results]
    } catch (error) {
        return [error, null]
    }
}

macros.set('list', listUniqueFieldValues)
macros.set('listDependenciesByTitle', listDependenciesByTitle)

export { runModelTemplates }
