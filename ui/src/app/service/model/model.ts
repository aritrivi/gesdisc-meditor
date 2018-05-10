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
    /**
     * Name of the model (ex: FAQ, Alert, Collection etc.,): displayed to the user in UI
     */
    name: string;
    /**
     * Description of the model (ex: FAQ, Alert, Collection etc.,): description of the model; might be shown to user as a tooltip
     */
    description: string;
    icon?: ModelIcon;
    /**
     * JSON Schema of the model itself
     */
    schema?: string;
    xMeditor?: ModelXmeditor;
    /**
     * Link to model's documentation
     */
    documentation?: string;
    /**
     * An array of tags associated with the model: can be used for searching models
     */
    tag?: Array<string>;
}