export const $storage = {
    get: (key: string): any => {
        const result = localStorage.getItem(key);

        if (!result) {
            return result;
        }

        try {
            return JSON.parse(result);
        } catch (error) {
            return result;
        }
    },

    set(key: string, value: any) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            localStorage.setItem(key, value);
        }
    },
    remove(key: string) {
        localStorage.removeItem(key);
    },
    clear() {
        localStorage.clear();
    },
};
