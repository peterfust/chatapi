import path from "path";
import fs from "fs";

export class ApiService {

    // Create an array of objects with the title of the API as given string and the path to the corresponding OAS file
    apis = [
        {
            title: "Legal Protection - 1.3.0",
            oas: path.join(__dirname, '../../resources/oas/legal-protection_1_3_0.json')
        }, {
            title: "Mobile Device Insurance - 1.1.0",
            oas: path.join(__dirname, '../../resources/oas/mobile-device-insurance_1_1_0.json')
        }, {
            title: "Rental Guarantee - 2.1.0",
            oas: path.join(__dirname, '../../resources/oas/rental-guarantee_2_1_0.json')
        }]

    getApiTitle(): string[] {
        return this.apis.map(api => api.title);
    }

    getOas(apiTitle: string): string {
        const api = this.apis.find(api => api.title === apiTitle);
        if (api) {
            return fs.readFileSync(api.oas, 'utf8');
        } else {
            throw new Error(`API with title ${apiTitle} not found`);
        }
    }
}