import {throwError} from 'rxjs';
import {ajax, AjaxRequest, AjaxResponse} from 'rxjs/ajax';
import {map, catchError} from 'rxjs/operators';
import {ObservableInput} from 'rxjs/internal/types';
import {$utils} from './utils';

interface MyAjaxRequest extends AjaxRequest {
    baseUrl?: string;
    type?: string;
    params?: any;
}

type RequestInterceptors<T> = (config: T) => T;
type ResponseInterceptors<T> = (response: AjaxResponse) => T;

class HttpRequest {
    private request: MyAjaxRequest = {
        baseUrl: '/',
        timeout: 10000,
        responseType: 'json',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    constructor(request?: MyAjaxRequest) {
        //  headers
        if (request) {
            request.headers = {
                ...this.request.headers,
                ...request?.headers,
            };
        }
        this.request = {...this.request, ...request};
    }

    //
    private requestResolve: RequestInterceptors<MyAjaxRequest> | null = null;
    private responseResolve: ResponseInterceptors<any> = resp => resp.response;
    private responseReject = (err: {
        type?: string;
        response: any;
    }): ObservableInput<any> => throwError(err);

    // get
    private handleUrl = (url: string, params: any): string => {
      if (params) {
            const paramArr: string[] = [];
            $utils.each(params, (elem, key) => {
                paramArr.push(`${key}=${encodeURIComponent(elem)}`);
            });
            const paramJoin = paramArr.join('&');

            if (url.search(/\?/) > 0) {
                return `${url}${paramJoin}`;
            }

            return `${url}?${paramJoin}`;
        }
        return url;
    };

    public interceptors = {
        request: (callback: RequestInterceptors<MyAjaxRequest>) =>
            (this.requestResolve = callback),
        response: (
            resolve?: ResponseInterceptors<any>,
            reject?: (err: any) => ObservableInput<any>,
        ) => {
            if (resolve) {
                this.responseResolve = resolve;
            }
            if (reject) {
                this.responseReject = reject;
            }
        },
    };

    private ajaxMethods = (
        url: string,
        type: 'cdn' | 'normal',
        method: 'GET' | 'POST',
        params?: any,
        request?: MyAjaxRequest,
    ) => {
        const isPost = method === 'POST';

        let requestEnd: MyAjaxRequest = {
            // get
            url: !isPost ? this.handleUrl(url, params) : url,
            ...this.request,
            ...request,
            params,
            type,
            method,
        };

        if (requestEnd.url?.startsWith('http')) {
            Reflect.set(requestEnd, 'baseUrl', '');
        }

        // post
        if (isPost) {
            requestEnd.body = params;
        }

        if (this.requestResolve) {
            requestEnd = this.requestResolve(requestEnd);
        }

        return ajax(requestEnd).pipe(
            map(this.responseResolve),
            catchError(this.responseReject),
        );
    };

    // json
    public json = (url: string, headers?: Record<string, any> | undefined) =>
        ajax.getJSON(`${this.request.baseUrl}/${url}`, headers);

    // get
    public get = (url: string, params?: any, request?: MyAjaxRequest) =>
        this.ajaxMethods(url, 'normal', 'GET', params, request);
    // post
    public post = (url: string, params?: any, request?: MyAjaxRequest) =>
        this.ajaxMethods(url, 'normal', 'POST', params, request);
    // json
    public getJson = (url: string, params?: any, request?: MyAjaxRequest) =>
        this.ajaxMethods(url, 'cdn', 'GET', params, request);
}

export default {
    create: (request?: MyAjaxRequest) => {
        return new HttpRequest(request);
    },
};
