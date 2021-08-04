import {$http} from './http';

export const staticSource = {
    getLangMsg: (lang: string) => {
        return $http.getJson(`/libs/i18n/${lang}.json`, {
            v: new Date().getTime(),
        });
    },
};
