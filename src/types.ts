import {DictEntry, MemberEntry} from './models';

export type BaseSource = string | number | boolean | object | null;
export type Source = BaseSource[] | object | Source[];

export type EntryType = MemberEntry | DictEntry;
export type SubMembers = EntryType[];
export type DictMembers = {[memberName: string]: SubMembers};
