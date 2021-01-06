import {createError} from "./error-utilities";

export const Errors = {
    BodyNotArray: 'BodyNotArray',
    ContentNotPublic: 'ContentNotPublic',
    ExpiredResetToken: 'ExpiredResetToken',
    InsufficientPrivileges: 'InsufficientPrivileges',
    InvalidCertificateId: 'InvalidCertificateId',
    InvalidContentDataId: 'InvalidContentDataId',
    InvalidContentId: 'InvalidContentId',
    InvalidEmail: 'InvalidEmail',
    InvalidFileExtension: 'InvalidFileExtension',
    InvalidFileName: 'InvalidFileName',
    InvalidId: 'InvalidId',
    InvalidImageDimensions: 'InvalidImageDimensions',
    InvalidName: 'InvalidName',
    InvalidPassword: 'InvalidPassword',
    InvalidParameterValue: 'InvalidParameterValue',
    InvalidResetToken: 'InvalidResetToken',
    MissingBodyProperty: 'MissingBodyProperty',
    MissingQueryParameter: 'MissingQueryParameter',
    NoCertificate: 'NoCertificate',
    NoPurchaseRecord: 'NoPurchaseRecord',
    PasswordsDontMatch: 'PasswordsDontMatch',
    RecordIncomplete: 'RecordIncomplete',
    UnableToAuthenticate: 'UnableToAuthenticate',
    UsedResetToken: 'UsedResetToken',
    UserAlreadyExists: 'UserAlreadyExists',
    UserDoesntExist: 'UserDoesntExist'
}

export function validatePassword(password) {
    if(!password || password.length < 6) {
        throw createError(Errors.InvalidPassword);
    }
}

export function validateName(name) {
    if(!name || name.length < 2) {
        throw createError(Errors.InvalidName);
    }
}
