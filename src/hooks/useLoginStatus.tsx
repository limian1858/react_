import {useEffect} from 'react';
import {Subscription} from 'rxjs';
import {walletInit} from '../assets/const/init.wallet';

export function useLoginStatus(
    func: (subscription: Subscription) => (() => void) | void,
    deps: any[] = [],
) {
    useEffect(() => {
        const subscription = new Subscription();
        let result: any;
        subscription.add(
          walletInit.loginStatus().subscribe(isLogin => {
                if (isLogin) {
                    result = func(subscription);
                }
            }),
        );
        return () => {
            subscription.unsubscribe();
            result && result();
        };
    }, deps);
}
