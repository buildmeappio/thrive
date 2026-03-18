/**
 * Centralized message constants for the application
 * This file contains all user-facing messages including success, error, and validation messages
 * Never expose database errors directly to users - always use these predefined messages
 */

// Generic/Common Messages
export const APP_MESSAGES = {
  SUCCESS: {
    SAVED: 'Saved successfully!',
    UPDATED: 'Updated successfully!',
    CREATED: 'Created successfully!',
    DELETED: 'Deleted successfully!',
    ACTIVATED: 'Activated successfully!',
    DEACTIVATED: 'Deactivated successfully!',
    ARCHIVED: 'Archived successfully!',
    SENT: 'Sent successfully!',
    LOADED: 'Loaded successfully!',
  },
  ERROR: {
    GENERIC: {
      UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.',
      OPERATION_FAILED: 'Operation failed. Please try again.',
      NETWORK_ERROR: 'Network error. Please check your connection and try again.',
      TIMEOUT: 'Request timed out. Please try again.',
      UNAUTHORIZED: 'You are not authorized to perform this action.',
      FORBIDDEN: 'Access denied.',
      NOT_FOUND: 'The requested resource was not found.',
      BAD_REQUEST: 'Invalid request. Please check your input.',
      SERVER_ERROR: 'Server error. Please try again later.',
    },
    DATABASE: {
      UNIQUE_CONSTRAINT: 'This {field} already exists. Please use a different value.',
      RECORD_NOT_FOUND: 'The requested record was not found.',
      FOREIGN_KEY_CONSTRAINT: 'Cannot perform this action due to related records.',
      RELATION_VIOLATION: 'Invalid relationship between records.',
      VALUE_TOO_LONG: 'The value entered is too long.',
      NULL_CONSTRAINT: 'Required field cannot be empty.',
      MISSING_REQUIRED_VALUE: 'Required field is missing.',
      MISSING_REQUIRED_ARGUMENT: 'Required information is missing.',
      RELATED_RECORD_NOT_FOUND: 'Related record was not found.',
      QUERY_ERROR: 'Database query error occurred.',
      RELATION_NOT_CONNECTED: 'Records are not properly connected.',
      REQUIRED_RECORDS_NOT_FOUND: 'Required records were not found.',
      INPUT_ERROR: 'Invalid input provided.',
      VALUE_OUT_OF_RANGE: 'Value is out of acceptable range.',
      TABLE_NOT_FOUND: 'Database configuration error.',
      COLUMN_NOT_FOUND: 'Database configuration error.',
      INCONSISTENT_DATA: 'Data inconsistency detected.',
      CONNECTION_TIMEOUT: 'Database connection timed out. Please try again.',
      UNSUPPORTED_FEATURE: 'This feature is not supported.',
      MULTIPLE_ERRORS: 'Multiple errors occurred.',
      VALIDATION_ERROR: 'Data validation failed.',
      CONNECTION_ERROR: 'Unable to connect to database. Please try again later.',
      INTERNAL_ERROR: 'Database internal error occurred.',
      UNKNOWN_ERROR: 'A database error occurred. Please try again.',
    },
  },
  VALIDATION: {
    REQUIRED: '{field} is required',
    MIN_LENGTH: '{field} must be at least {min} characters',
    MAX_LENGTH: '{field} must not exceed {max} characters',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_FORMAT: '{field} format is invalid',
    ALPHABETIC_REQUIRED: '{field} must contain at least one letter',
    ALPHANUMERIC_REQUIRED: '{field} must contain at least one letter or number',
    DUPLICATE_VALUE: 'This {field} already exists',
    INVALID_NUMBER: '{field} must be a valid number',
    INVALID_DATE: 'Please enter a valid date',
    INVALID_TIME: 'Please enter time in format "8:00 AM" or as minutes',
    EMPTY_OR_SPACES: '{field} cannot be empty or contain only spaces',
    MIN_VALUE: '{field} must be at least {min}',
    MAX_VALUE: '{field} must not exceed {max}',
  },
} as const;

// Organization Domain Messages
export const ORGANIZATION_MESSAGES = {
  SUCCESS: {
    INVITATION_SENT: 'Superadmin invitation sent successfully!',
    INVITATION_RESENT: 'Invitation resent successfully!',
    INVITATION_REVOKED: 'Invitation revoked successfully!',
    PREVIOUS_INVITATION_CANCELLED:
      'Previous invitation cancelled. New invitation sent successfully!',
    USER_ACTIVATED: 'User activated successfully!',
    USER_DEACTIVATED: 'User deactivated successfully!',
    SUPERADMIN_REMOVED: 'Superadmin removed successfully!',
    ORGANIZATION_CREATED: 'Organization created and invitation sent successfully!',
    ORGANIZATION_UPDATED: 'Organization updated successfully!',
    ORGANIZATION_DELETED: 'Organization deleted successfully!',
    // Location messages
    LOCATION_CREATED: 'Location created successfully!',
    LOCATION_UPDATED: 'Location updated successfully!',
    LOCATION_DELETED: 'Location deleted successfully!',
    LOCATION_STATUS_UPDATED: 'Location status updated successfully!',
    // HQ Address messages
    HQ_ADDRESS_ADDED: 'HQ Address added successfully!',
    HQ_ADDRESS_UPDATED: 'HQ Address updated successfully!',
    // Group messages
    GROUP_CREATED: 'Group created successfully!',
    GROUP_UPDATED: 'Group updated successfully!',
    GROUP_DELETED: 'Group deleted successfully!',
    // Role messages
    ROLE_CREATED: 'Role created successfully!',
    ROLE_UPDATED: 'Role updated successfully!',
    ROLE_DELETED: 'Role deleted successfully!',
    // Permission messages
    PERMISSIONS_UPDATED: 'Permissions updated successfully!',
  },
  ERROR: {
    FAILED_TO_LOAD_USERS: 'Failed to load organization users',
    FAILED_TO_SEND_INVITATION: 'Failed to send invitation',
    FAILED_TO_RESEND_INVITATION: 'Failed to resend invitation',
    FAILED_TO_REVOKE_INVITATION: 'Failed to revoke invitation',
    FAILED_TO_ACTIVATE_USER: 'Failed to activate user',
    FAILED_TO_DEACTIVATE_USER: 'Failed to deactivate user',
    FAILED_TO_REMOVE_SUPERADMIN: 'Failed to remove superadmin',
    FAILED_TO_CREATE_ORGANIZATION: 'Failed to create organization',
    FAILED_TO_UPDATE_ORGANIZATION: 'Failed to update organization',
    FAILED_TO_DELETE_ORGANIZATION: 'Failed to delete organization',
    FAILED_TO_LOAD_ORGANIZATION: 'Failed to load organization',
    FAILED_TO_LIST_ORGANIZATIONS: 'Failed to load organizations',
    FAILED_TO_CHECK_NAME: 'Failed to verify organization name',
    ORGANIZATION_NOT_FOUND: 'Organization not found',
    EMAIL_ALREADY_REGISTERED:
      'This email is already registered as a user. Each email can only be registered once.',
    EMAIL_ALREADY_INVITED:
      'This email already has a pending or accepted invitation for an organization.',
    UNEXPECTED_ERROR: APP_MESSAGES.ERROR.GENERIC.UNEXPECTED_ERROR,
    TRY_AGAIN: 'Please try again.',
    // Location error messages
    FAILED_TO_LOAD_LOCATIONS: 'Failed to load locations',
    FAILED_TO_CREATE_LOCATION: 'Failed to create location',
    FAILED_TO_UPDATE_LOCATION: 'Failed to update location',
    FAILED_TO_DELETE_LOCATION: 'Failed to delete location',
    FAILED_TO_UPDATE_LOCATION_STATUS: 'Failed to update location status',
    LOCATION_NAME_EXISTS: 'A location with this name already exists',
    LOCATION_NOT_FOUND: 'Location not found',
    // HQ Address error messages
    FAILED_TO_UPDATE_HQ_ADDRESS: 'Failed to update HQ address',
    // Group error messages
    FAILED_TO_LOAD_GROUPS: 'Failed to load groups',
    FAILED_TO_CREATE_GROUP: 'Failed to create group',
    FAILED_TO_UPDATE_GROUP: 'Failed to update group',
    FAILED_TO_DELETE_GROUP: 'Failed to delete group',
    GROUP_NOT_FOUND: 'Group not found',
    GROUP_LOCATIONS_REQUIRED: 'At least one location is required for Location Set scope',
    GROUP_LOCATIONS_INVALID:
      'One or more locations are invalid or do not belong to this organization',
    GROUP_MEMBERS_INVALID: 'One or more members are invalid or do not belong to this organization',
    // Role error messages
    FAILED_TO_LOAD_ROLES: 'Failed to load roles',
    FAILED_TO_CREATE_ROLE: 'Failed to create role',
    FAILED_TO_UPDATE_ROLE: 'Failed to update role',
    FAILED_TO_DELETE_ROLE: 'Failed to delete role',
    ROLE_NOT_FOUND: 'Role not found',
    ROLE_NAME_EXISTS: 'A role with this name already exists',
    ROLE_KEY_EXISTS: 'A role with this key already exists',
    ROLE_IN_USE: 'Cannot delete role that is assigned to users',
    ROLE_SUPER_ADMIN_PROTECTED: 'Cannot delete SUPER_ADMIN role',
    // Permission error messages
    FAILED_TO_LOAD_PERMISSIONS: 'Failed to load permissions',
    FAILED_TO_LOAD_ROLE_PERMISSIONS: 'Failed to load role permissions',
    FAILED_TO_ASSIGN_PERMISSIONS: 'Failed to assign permissions to role',
    PERMISSIONS_INVALID: 'One or more permissions are invalid',
  },
  VALIDATION: {
    ORGANIZATION_NAME: {
      REQUIRED: 'Organization name is required',
      MIN_LENGTH: 'Organization name must be at least 2 characters',
      ALREADY_EXISTS: 'This organization name is already taken',
      EMPTY_OR_SPACES: 'Organization name cannot be empty or contain only spaces',
      ALPHABETIC: 'Organization name must contain at least one letter',
    },
    FIRST_NAME: {
      REQUIRED: 'First name is required',
      MIN_LENGTH: 'First name must be at least 2 characters',
      ALPHABETIC: 'First name must contain at least one letter',
    },
    LAST_NAME: {
      REQUIRED: 'Last name is required',
      MIN_LENGTH: 'Last name must be at least 2 characters',
      ALPHABETIC: 'Last name must contain at least one letter',
    },
    EMAIL: {
      REQUIRED: 'Email is required',
      INVALID: 'Please enter a valid email address',
    },
    ADDRESS: {
      REQUIRED: 'Address is required',
      MIN_LENGTH: 'Address must be at least 4 characters',
      MAX_LENGTH: 'Address must be less than 255 characters',
      LINE2_MAX_LENGTH: 'Address line 2 must be less than 255 characters',
      CITY_REQUIRED: 'City is required',
      CITY_MIN_LENGTH: 'City must be at least 4 characters',
      CITY_MAX_LENGTH: 'City must be less than 100 characters',
      STATE_REQUIRED: 'State/Province is required',
      STATE_MAX_LENGTH: 'State/Province must be less than 100 characters',
      POSTAL_CODE_REQUIRED: 'Postal code is required',
      POSTAL_CODE_INVALID: 'Invalid postal code format',
      LATITUDE_RANGE: 'Latitude must be between -90 and 90',
      LONGITUDE_RANGE: 'Longitude must be between -180 and 180',
      NAME_REQUIRED: 'Location name is required',
      NAME_MIN_LENGTH: 'Location name must be at least 2 characters',
      NAME_MAX_LENGTH: 'Location name must be less than 255 characters',
      TIMEZONE_REQUIRED: 'Timezone is required',
      TIMEZONE_INVALID: 'Please select a valid timezone',
    },
  },
} as const;

// Examiner Domain Messages
export const EXAMINER_MESSAGES = {
  SUCCESS: {
    CREATED: 'Examiner created successfully!',
    UPDATED: 'Examiner updated successfully!',
    DELETED: 'Examiner deleted successfully!',
    ACTIVATED: 'Examiner activated successfully!',
    DEACTIVATED: 'Examiner deactivated successfully!',
    SUSPENDED: 'Examiner suspended successfully!',
    REACTIVATED: 'Examiner reactivated successfully!',
    APPROVED: 'Examiner approved successfully!',
    REJECTED: 'Examiner rejected successfully!',
    INFO_REQUESTED: 'Information request sent successfully!',
    CONTRACT_SENT: 'Contract sent successfully!',
  },
  ERROR: {
    FAILED_TO_LOAD: 'Failed to load examiner',
    FAILED_TO_CREATE: 'Failed to create examiner',
    FAILED_TO_UPDATE: 'Failed to update examiner',
    FAILED_TO_DELETE: 'Failed to delete examiner',
    FAILED_TO_ACTIVATE: 'Failed to activate examiner',
    FAILED_TO_DEACTIVATE: 'Failed to deactivate examiner',
    FAILED_TO_SUSPEND: 'Failed to suspend examiner',
    FAILED_TO_REACTIVATE: 'Failed to reactivate examiner',
    FAILED_TO_APPROVE: 'Failed to approve examiner',
    FAILED_TO_REJECT: 'Failed to reject examiner',
    FAILED_TO_REQUEST_INFO: 'Failed to request information',
    FAILED_TO_SEND_CONTRACT: 'Failed to send contract',
    FAILED_TO_LOAD_LIST: 'Failed to load examiners',
  },
} as const;

// Case Domain Messages
export const CASE_MESSAGES = {
  SUCCESS: {
    CREATED: 'Case created successfully!',
    UPDATED: 'Case updated successfully!',
    DELETED: 'Case deleted successfully!',
    APPROVED: 'Case approved successfully!',
    REJECTED: 'Case rejected successfully!',
    COMPLETED: 'Case completed successfully!',
    INFO_REQUESTED: 'Information request sent successfully!',
  },
  ERROR: {
    FAILED_TO_LOAD: 'Failed to load case',
    FAILED_TO_CREATE: 'Failed to create case',
    FAILED_TO_UPDATE: 'Failed to update case',
    FAILED_TO_DELETE: 'Failed to delete case',
    FAILED_TO_APPROVE: 'Failed to approve case',
    FAILED_TO_REJECT: 'Failed to reject case',
    FAILED_TO_COMPLETE: 'Failed to complete case',
    FAILED_TO_REQUEST_INFO: 'Failed to request information',
    FAILED_TO_LOAD_LIST: 'Failed to load cases',
  },
} as const;

// Transporter Domain Messages
export const TRANSPORTER_MESSAGES = {
  SUCCESS: {
    CREATED: 'Transporter created successfully!',
    UPDATED: 'Transporter updated successfully!',
    DELETED: 'Transporter deleted successfully!',
  },
  ERROR: {
    FAILED_TO_LOAD: 'Failed to load transporter',
    FAILED_TO_CREATE: 'Failed to create transporter',
    FAILED_TO_UPDATE: 'Failed to update transporter',
    FAILED_TO_DELETE: 'Failed to delete transporter',
    FAILED_TO_LOAD_LIST: 'Failed to load transporters',
  },
  VALIDATION: {
    COMPANY_NAME_REQUIRED: 'Company name is required and cannot be only spaces',
    CONTACT_PERSON_REQUIRED: 'Contact person is required and cannot be only spaces',
    EMAIL_REQUIRED: 'Email is required and cannot be only spaces',
    EMAIL_INVALID: 'Please enter a valid email address',
  },
} as const;

// Interpreter Domain Messages
export const INTERPRETER_MESSAGES = {
  SUCCESS: {
    CREATED: 'Interpreter created successfully!',
    UPDATED: 'Interpreter updated successfully!',
    DELETED: 'Interpreter deleted successfully!',
  },
  ERROR: {
    FAILED_TO_LOAD: 'Failed to load interpreter',
    FAILED_TO_CREATE: 'Failed to create interpreter',
    FAILED_TO_UPDATE: 'Failed to update interpreter',
    FAILED_TO_DELETE: 'Failed to delete interpreter',
    FAILED_TO_LOAD_LIST: 'Failed to load interpreters',
  },
  VALIDATION: {
    COMPANY_NAME_REQUIRED: 'Company name is required and cannot be only spaces',
    CONTACT_PERSON_REQUIRED: 'Contact person is required and cannot be only spaces',
    EMAIL_REQUIRED: 'Email is required and cannot be only spaces',
    EMAIL_INVALID: 'Please enter a valid email address',
    LANGUAGE_REQUIRED: 'At least one language is required',
  },
} as const;

// Contract Template Domain Messages
export const CONTRACT_TEMPLATE_MESSAGES = {
  SUCCESS: {
    CREATED: 'Contract template created successfully!',
    UPDATED: 'Contract template updated successfully!',
    DELETED: 'Contract template deleted successfully!',
    PUBLISHED: 'Contract template published successfully!',
    SAVED: 'Contract template saved successfully!',
  },
  ERROR: {
    FAILED_TO_LOAD: 'Failed to load contract template',
    FAILED_TO_CREATE: 'Failed to create contract template',
    FAILED_TO_UPDATE: 'Failed to update contract template',
    FAILED_TO_DELETE: 'Failed to delete contract template',
    FAILED_TO_PUBLISH: 'Failed to publish contract template',
    FAILED_TO_SAVE: 'Failed to save contract template',
    FAILED_TO_LOAD_LIST: 'Failed to load contract templates',
    FAILED_TO_LOAD_VARIABLES: 'Failed to load variables',
    FAILED_TO_LOAD_FEE_STRUCTURES: 'Failed to load fee structures',
  },
  VALIDATION: {
    SLUG_FORMAT: 'Slug must contain only lowercase letters, numbers, and hyphens',
    DISPLAY_NAME_REQUIRED: 'Display name is required',
    DISPLAY_NAME_MIN_LENGTH: 'Display name must be at least 2 characters',
    DISPLAY_NAME_MAX_LENGTH: 'Display name must not exceed 100 characters',
    DISPLAY_NAME_FORMAT: 'Display name contains invalid characters',
    DISPLAY_NAME_ALPHABETIC: 'Display name must contain at least one letter',
  },
} as const;

// Fee Structure Domain Messages
export const FEE_STRUCTURE_MESSAGES = {
  SUCCESS: {
    CREATED: 'Fee structure created successfully!',
    UPDATED: 'Fee structure updated successfully!',
    DELETED: 'Fee structure deleted successfully!',
    ACTIVATED: 'Fee structure activated successfully!',
    ARCHIVED: 'Fee structure archived successfully!',
    SAVED: 'Fee structure saved successfully!',
  },
  ERROR: {
    FAILED_TO_LOAD: 'Failed to load fee structure',
    FAILED_TO_CREATE: 'Failed to create fee structure',
    FAILED_TO_UPDATE: 'Failed to update fee structure',
    FAILED_TO_DELETE: 'Failed to delete fee structure',
    FAILED_TO_ACTIVATE: 'Failed to activate fee structure',
    FAILED_TO_ARCHIVE: 'Failed to archive fee structure',
    FAILED_TO_SAVE: 'Failed to save fee structure',
    FAILED_TO_LOAD_LIST: 'Failed to load fee structures',
  },
  VALIDATION: {
    MISSING_REQUIRED_FIELDS: 'Please fill in all required fields',
    INVALID_VARIABLE_VALUES: 'Some variable values are invalid',
    NAME_REQUIRED: 'Name is required',
    NAME_MIN_LENGTH: 'Name must be at least 2 characters',
    NAME_MAX_LENGTH: 'Name must not exceed 100 characters',
    NAME_FORMAT: 'Name contains invalid characters',
    NAME_ALPHABETIC: 'Name must contain at least one letter',
    DESCRIPTION_MAX_LENGTH: 'Description must not exceed 5000 characters',
    INVALID_ID: 'Invalid ID format',
    LABEL_REQUIRED: 'Label is required',
    LABEL_MIN_LENGTH: 'Label must be at least 2 characters',
    LABEL_MAX_LENGTH: 'Label must not exceed 80 characters',
    LABEL_FORMAT: 'Label contains invalid characters',
    LABEL_ALPHABETIC: 'Label must contain at least one letter',
    KEY_REQUIRED: 'Key is required',
    KEY_MAX_LENGTH: 'Key must not exceed 64 characters',
    KEY_FORMAT:
      'Key must be in snake_case format (lowercase letters, numbers, and underscores only, starting with a letter)',
    VARIABLE_TYPE_INVALID: 'Invalid variable type',
    CURRENCY_MAX_LENGTH: 'Currency code must not exceed 3 characters',
    DECIMALS_INTEGER: 'Decimals must be an integer',
    DECIMALS_MIN: 'Decimals must be at least 0',
    DECIMALS_MAX: 'Decimals must not exceed 6',
    UNIT_MAX_LENGTH: 'Unit must not exceed 20 characters',
    REFERENCE_KEY_MAX_LENGTH: 'Reference key must not exceed 64 characters',
    REFERENCE_KEY_FORMAT: 'Reference key must be in snake_case format',
    COMPOSITE_SUBFIELDS_REQUIRED: 'Composite variables must have at least one sub-field',
    DUPLICATE_SUBFIELD_KEY: 'Duplicate sub-field key',
    REQUIRED_SUBFIELD_DEFAULT_VALUE: 'Required sub-fields must have a default value',
    SUBFIELD_DEFAULT_NUMBER: 'Default value must be a number for NUMBER or MONEY types',
    SUBFIELD_DEFAULT_STRING: 'Default value must be a string for TEXT type',
    CURRENCY_MONEY_ONLY: 'Currency can only be set for MONEY type variables',
    DECIMALS_MONEY_NUMBER_ONLY: 'Decimals can only be set for MONEY or NUMBER type variables',
    DEFAULT_VALUE_REQUIRED: 'Required variables must have a default value',
    DEFAULT_VALUE_INVALID_NUMBER: 'Default value must be a valid number',
    DEFAULT_VALUE_NEGATIVE: 'Default value cannot be negative',
    DEFAULT_VALUE_TOO_LARGE: 'Default value is too large (maximum: 999,999,999.99)',
    DEFAULT_VALUE_INVALID_BOOLEAN: 'Default value must be true or false for BOOLEAN type',
    DEFAULT_VALUE_INVALID_STRING: 'Default value must be a string for TEXT type',
    DEFAULT_VALUE_EMPTY_WHEN_REQUIRED: 'Default value cannot be empty for required TEXT variables',
    SUB_FIELD_KEY_REQUIRED: 'Sub-field key is required',
    SUB_FIELD_KEY_MAX_LENGTH: 'Sub-field key must not exceed 64 characters',
    SUB_FIELD_KEY_FORMAT: 'Sub-field key must be in snake_case format',
    SUB_FIELD_LABEL_REQUIRED: 'Sub-field label is required',
    SUB_FIELD_LABEL_MAX_LENGTH: 'Sub-field label must not exceed 80 characters',
    SUB_FIELD_TYPE_INVALID: 'Invalid sub-field type',
    INVALID_VARIABLE_ID: 'Invalid variable ID format',
  },
} as const;

// Taxonomy Domain Messages
export const TAXONOMY_MESSAGES = {
  SUCCESS: {
    CREATED: '{type} created successfully',
    UPDATED: '{type} updated successfully',
    DELETED: '{type} deleted successfully',
  },
  ERROR: {
    FAILED_TO_LOAD: 'Failed to load {type}',
    FAILED_TO_CREATE: 'Failed to create {type}',
    FAILED_TO_UPDATE: 'Failed to update {type}',
    FAILED_TO_DELETE: 'Failed to delete {type}',
    FAILED_TO_LOAD_LIST: 'Failed to load {type} list',
    CANNOT_DELETE_ASSIGNED: 'Cannot delete {type}. It is assigned to {count} {unit}.',
    DUPLICATE_NAME: 'A {type} with this name already exists',
  },
  VALIDATION: {
    NAME_REQUIRED: '{field} is required',
    NAME_EMPTY_OR_SPACES: '{field} cannot be empty or contain only spaces',
    NAME_ALPHANUMERIC: '{field} must contain at least one letter or number',
    NAME_MAX_LENGTH: '{field} must not exceed {max} characters',
    VALUE_INVALID_NUMBER: '{field} must be a valid number',
    VALUE_INVALID_TIME: 'Please enter time in format "8:00 AM" or as minutes',
  },
} as const;

// User Domain Messages
export const USER_MESSAGES = {
  SUCCESS: {
    CREATED: 'User created successfully!',
    UPDATED: 'User updated successfully!',
    DELETED: 'User deleted successfully!',
    ACTIVATED: 'User activated successfully!',
    DEACTIVATED: 'User deactivated successfully!',
  },
  ERROR: {
    FAILED_TO_LOAD: 'Failed to load user',
    FAILED_TO_CREATE: 'Failed to create user',
    FAILED_TO_UPDATE: 'Failed to update user',
    FAILED_TO_DELETE: 'Failed to delete user',
    FAILED_TO_LOAD_LIST: 'Failed to load users',
  },
} as const;

// Auth Domain Messages
export const AUTH_MESSAGES = {
  SUCCESS: {
    LOGIN_SUCCESS: 'Login successful!',
    LOGOUT_SUCCESS: 'Logged out successfully!',
    PASSWORD_RESET_SENT: 'Password reset email sent successfully!',
    PASSWORD_RESET: 'Password reset successfully!',
    PASSWORD_CHANGED: 'Password changed successfully!',
    EMAIL_SENT: 'Email sent successfully!',
  },
  ERROR: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_LOCKED: 'Account is locked. Please contact support.',
    ACCOUNT_INACTIVE: 'Account is inactive. Please contact support.',
    PASSWORD_RESET_FAILED: 'Failed to reset password',
    PASSWORD_CHANGE_FAILED: 'Failed to change password',
    EMAIL_SEND_FAILED: 'Failed to send email',
    TOKEN_INVALID: 'Invalid or expired token',
    TOKEN_EXPIRED: 'Token has expired',
    UNAUTHORIZED: 'You are not authorized to access this resource',
  },
  VALIDATION: {
    EMAIL_INVALID: 'Please enter a valid email address',
    PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
    ADDRESS_REQUIRED: 'Address is required',
  },
} as const;

// Custom Variable Domain Messages
export const CUSTOM_VARIABLE_MESSAGES = {
  SUCCESS: {
    CREATED: 'Custom variable created successfully!',
    UPDATED: 'Custom variable updated successfully!',
    DELETED: 'Custom variable deleted successfully!',
  },
  ERROR: {
    FAILED_TO_LOAD: 'Failed to load custom variable',
    FAILED_TO_CREATE: 'Failed to create custom variable',
    FAILED_TO_UPDATE: 'Failed to update custom variable',
    FAILED_TO_DELETE: 'Failed to delete custom variable',
    FAILED_TO_LOAD_LIST: 'Failed to load custom variables',
  },
  VALIDATION: {
    KEY_REQUIRED: 'Key is required',
    KEY_ALPHANUMERIC: 'Key must contain at least one letter or number',
    LABEL_REQUIRED: 'Label is required',
    CHECKBOX_OPTIONS_REQUIRED: 'At least one checkbox option is required',
    OPTION_LABEL_REQUIRED: 'Label is required',
    OPTION_VALUE_REQUIRED: 'Value is required',
    OPTION_VALUE_FORMAT: 'Value must be lowercase letters, numbers, and underscores only',
    DUPLICATE_VALUES: 'Duplicate values are not allowed',
  },
} as const;

// Benefit Domain Messages
export const BENEFIT_MESSAGES = {
  SUCCESS: {
    CREATED: 'Benefit created successfully!',
    UPDATED: 'Benefit updated successfully!',
    DELETED: 'Benefit deleted successfully!',
  },
  ERROR: {
    FAILED_TO_LOAD: 'Failed to load benefit',
    FAILED_TO_CREATE: 'Failed to create benefit',
    FAILED_TO_UPDATE: 'Failed to update benefit',
    FAILED_TO_DELETE: 'Failed to delete benefit',
    FAILED_TO_LOAD_LIST: 'Failed to load benefits',
    FAILED_TO_LOAD_EXAMINATION_TYPES: 'Failed to load examination types',
  },
} as const;

// Chaperone Domain Messages
export const CHAPERONE_MESSAGES = {
  SUCCESS: {
    CREATED: 'Chaperone created successfully!',
    UPDATED: 'Chaperone updated successfully!',
    DELETED: 'Chaperone deleted successfully!',
  },
  ERROR: {
    FAILED_TO_LOAD: 'Failed to load chaperone',
    FAILED_TO_CREATE: 'Failed to create chaperone',
    FAILED_TO_UPDATE: 'Failed to update chaperone',
    FAILED_TO_DELETE: 'Failed to delete chaperone',
    FAILED_TO_LOAD_LIST: 'Failed to load chaperones',
  },
} as const;
