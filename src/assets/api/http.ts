import {throwError} from 'rxjs';
import httpRequest from '../const/httpRequest';
// console.log('process.env.REACT_APP_HTTP_URL', process.env.REACT_APP_HTTP_URL);
const $http = httpRequest.create({
    baseUrl: process.env.REACT_APP_HTTP_URL,
    timeout: 20000,
    headers: {},
});

const myDataPath:string = '';

$http.interceptors.request(config => {
    if (config.type === 'cdn') {
        config.url = `${process.env.REACT_APP_CDN}${config.url}`;
    } else {
        config.url = `${config.baseUrl}${config.url}`;
    }
    return config;
});

$http.interceptors.response(
    resp => {
        const {response} = resp;
        if (response) {
            return response;
        }

        throw resp;
    },
    error => {
        console.log(error);
        if (error.type === '0') {
            return throwError(error.response);
        }
        return [];
    },
);

const Post = async function (url: string, params: any) {
    return $http.post(url, params).toPromise();
};


export {$http,Post,myDataPath};

