import { config } from '../../config.js';
import axiosInstance from './axiosApi';

interface AxiosResponse {
    data: any
}

export class Service {
    protected _service_url: string = config.API_URL;

    protected _get<T>(path: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            axiosInstance.get(`${this._service_url}/api/play/${path}`)
                .then ((resp: AxiosResponse) => {
                    resolve(resp.data);
                })
                .catch( err => reject(err))
        })
    }

    protected _post<T>(path: string, content: any, headers?: any): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            axiosInstance.post(`${this._service_url}/api/play/${path}`, content, headers)
                .then((resp:AxiosResponse) => {
                    resolve(resp.data);
                })
                .catch( err => reject(err))
        })
    }
}

export default new Service();