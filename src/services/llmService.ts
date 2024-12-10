import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableLambda } from "@langchain/core/runnables";
import dotenv from "dotenv";
import {QuestionsRequest} from "../types/types";

dotenv.config();

const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0,
});


const json_schema = {
    "title": "llmResponseSchema",
    "description": "LLM response schema for API testing",
    "type": "object",
    "properties": {
        "llmComment": {
            "type": "string",
            "description": "The plaintext answer to the user question",
        },
        "httpMethod": {
            "type": "string",
            "description": "The HTTP method of the OAS operation"
        },
        "httpBasepath": {
            "type": "string",
            "description": "The basepath of the OAS operation",
        },
        "operationSummary": {
            "type": "string",
            "description": "The summary of the OAS operation",
        },
        "operationScopes": {
            "type": "array",
            "items": {"type": "string"},
            "description": "The scopes of the OAS within the overall securitySchemes scopes section. Not only for the operation but provide all",
        },
        "jsonDocument": {
            "type": "string",
            "description": "The valid JSON request for the OAS operation",
        },
        "apiName": {
            "type": "string",
            "description": "The name of the API you are testing",
        },
    },
    "required": ["llmComment"],
};

const modelWithStructure = model.withStructuredOutput(json_schema);

const systemPromptInitial = `You are a helpful assistant and your task is to support the user in understanding a given 
OpenAPI Specification (OAS) and in creating valid JSON requests for API testing.
Analyze the provided OpenAPI Specification and provide the correct answer to the user question. If you cannot find  
the correct answer in the OAS respond that you don't know and do not invent any answer. If asked by the user to create a
JSON request, find out the correct operation based on the user question and generate the corresponding JSON request. 
Respect the following rules for the JSON generation:
- Create examples for all optional attributes if not explicitly specified by the user to not be included
- Ignore the example values from the OAS document, be creative and invent your own examples
- Today's date is ${new Date().toISOString().split('T')[0]}
- For begin date attributes set today's date plus one day if not specified by the user
- Respect the address information for street name, zip, city based on the given country
Allow the user to change the attribute values (but only the value not the attribute name) to invalid values, 
but always comment that this is invalid but might be good for certain specific test cases. 
Answer always in the same language as the user question was asked. 
This is the OpenAPI Specification you should use: {oas}`;


const systemPromptFollowUp = `Please use the json_document below as base for your answer and only adjust attributes 
which are explicitly mentioned by the user question. Do not touch any other attributes. But always respect the schema 
definition of the OAS. This is the json_document you should use: {json_document}`;



const promptTemplateInitial = ChatPromptTemplate.fromMessages([
    ['system', systemPromptInitial],
    ['user', "{question}"]
]);

const promptTemplateFollowUp = ChatPromptTemplate.fromMessages([
    ['system', systemPromptInitial + systemPromptFollowUp],
    ['user', "{question}"]
]);

function route(data: QuestionsRequest): ChatPromptTemplate {
    if (data.json_document) {
        console.log("Follow up");
        console.log(promptTemplateFollowUp);
        return promptTemplateFollowUp;
    } else {
        return promptTemplateInitial;
    }
}

export const chain = RunnableLambda.from(route)
    .pipe(modelWithStructure);