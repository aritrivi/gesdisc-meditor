/**
 * Model Editor API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: 0.0.1
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
import { ModelIcon } from './modelIcon';
import { ModelXmeditor } from './modelXmeditor';



export interface Model {
    xMeditor?: ModelXmeditor;
    /**
     * Name of the model
     */
    name: string;
    /**
     * Model's description
     */
    description: string;
    icon?: ModelIcon;
    /**
     * Model's workflow
     */
    workflow?: string;
    initEdge?: string;
    /**
     * Model's schema
     */
    schema: string;
    /**
     * Model layout based on Angular JSON Schema form
     */
    layout?: string;
    /**
     * Property name in the Model's schema for using as title of the document instance of the model
     */
    titleProperty?: string;
    /**
     * Any documentation (text) for the Model
     */
    documentation?: string;
    tag?: Array<string>;
}
