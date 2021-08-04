import React, {Component, lazy, useEffect} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import './App.css';
import {ThemeProvider} from 'styled-components';
import {Provider} from 'react-redux';
import {UseWalletProvider} from 'use-wallet';
import config from './config';
import {useLoginStatus} from './hooks/useLoginStatus';
import {walletInit} from './assets/const/init.wallet';
import {$storage} from './assets/const/storage';
import Text from './views/Text/Text';
import i18next from 'i18next';
import {useTranslation, initReactI18next} from 'react-i18next';
import EN from './locales/en-US';
import ZH from './locales/zh-CN';
import KO from './locales/ko-KR';

let lng = 'en';
i18next
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {...EN},
            },
            zh: {
                translation: {...ZH},
            },
            ko: {
                translation: {...KO},
            },
        },
        lng: lng,
        fallbackLng: lng,

        interpolation: {
            escapeValue: false,
        },
    }).then();
// i18n.changeLanguage(lang);
const App: React.FC = () => {
    const {t} = useTranslation();
    // @ts-ignore
    React['translate'] = t;
    useEffect(() => {
        const account = $storage.get('Account');
        if (account) {
            walletInit.accountStatusObservable.next(account);
            walletInit.connectStatusObservable.next(true);
        } else {
            walletInit.accountStatusObservable.next('');
            walletInit.connectStatusObservable.next(false);
        }
    }, []);
    useLoginStatus(sub => {
        sub.add(
            walletInit.chainIdObservable.subscribe(chainId => {
                if (Number(chainId) !== Number($storage.get('ChangeId'))) {
                    $storage.set('ChangeId', chainId);
                }
            }),
        );
        sub.add(
            walletInit.accountStatusObservable.subscribe(account => {
                if (account !== $storage.get('Account')) {
                    $storage.set('Account', account);
                }
            }),
        );
    });
    return (
        <UseWalletProvider chainId={config.chainId}>
            <Router>
                <Switch>
                    <Route path='/'>
                        <Text/>
                    </Route>
                </Switch>
            </Router>
        </UseWalletProvider>
    );
};

export default App;
