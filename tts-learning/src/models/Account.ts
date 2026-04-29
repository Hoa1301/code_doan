import { ModelBase } from './ModeBase';

export interface Account extends ModelBase {
    fullName: string;
    email: string;
    password?: string;
    phone?: string;
    avatar?: string;
    role_id: string;
    status: string;
}
