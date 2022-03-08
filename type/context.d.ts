import React from 'react';
import { IMemberItem } from './interface';
declare const MemberContext: React.Context<IMemberItem[]>;
export declare const MemberContextProvider: React.Provider<IMemberItem[]>;
export declare const MemberContextConsumer: React.Consumer<IMemberItem[]>;
export default MemberContext;
