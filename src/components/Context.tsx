import React from 'react';
import {API} from '../data/api/API';
import {UserShortInfo, UserInfo} from '../data/types';

export const APIContext = React.createContext<API>(new API());

export const CurrentUserIdContext = React.createContext<UserShortInfo['id']>(0);

export const CurrentUserContext = React.createContext<UserInfo | undefined>(undefined);
