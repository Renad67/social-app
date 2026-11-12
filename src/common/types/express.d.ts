import {Iuser} from '../interfaces'
// re-open
declare module "express-serve-static-core" {
    // re-open
    interface Request {
        user: Iuser;
    }
}
