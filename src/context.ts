import React from 'React';
import { IMemberItem } from './interface';

const MemberContext = React.createContext<IMemberItem[]>([]);

export const MemberContextProvider = MemberContext.Provider;
export const MemberContextConsumer = MemberContext.Consumer;

export default MemberContext;
