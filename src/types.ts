import {DictEntry, MemberEntry} from './models';

export type Source = string | number | boolean | object | null | Source[];

export type EntryType = MemberEntry | DictEntry;
export type SubMembers = EntryType[];
export type DictMembers = {[memberName: string]: SubMembers};
