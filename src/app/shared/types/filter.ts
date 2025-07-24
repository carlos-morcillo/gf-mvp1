export enum StringMatchModes {
  StartsWith = 'StartsWith',
  Contains = 'Contains',
  NotContains = 'NotContains',
  EndsWith = 'EndsWith',
  Equal = 'Equal',
  NotEqual = 'NotEqual',
  In = 'In',
}

export enum NumberMatchModes {
  GreaterThan = 'GreaterThan',
  GreaterThanOrEqual = 'GreaterThanOrEqual',
  LessThan = 'LessThan',
  LessThanOrEqual = 'LessThanOrEqual',
  Equal = 'Equal',
  NotEqual = 'NotEqual',
  In = 'In',
}

export enum DateMatchModes {
  Equal = 'Equal',
  NotEqual = 'NotEqual',
  Before = 'Before',
  BeforeOrEqual = 'BeforeOrEqual',
  After = 'After',
  AfterOrEqual = 'AfterOrEqual',
}

export enum BooleanMatchModes {
  Equal = 'Equal',
  NotEqual = 'NotEqual',
}

export enum NullMatchModes {
  IsNull = 'IsNull',
  IsNotNull = 'IsNotNull',
}

export type MatchModes =
  | StringMatchModes
  | NumberMatchModes
  | DateMatchModes
  | BooleanMatchModes
  | NullMatchModes;

export enum LogicOperators {
  Or = 'or',
  And = 'and',
}

export enum AssignmentTypes {
  STATIC = 'static',
  SYSTEM_VAR = 'systemVar',
  SESSION_VAR = 'sessionVar',
  FORMULA = 'formula',
  CONTROL = 'control',
  PARAM = 'param',
  QUERY_PARAM = 'queryParam',
}

export type Filters = Array<Filter | Array<Filter>>;

export interface Filter {
  leftHand: {
    type: AssignmentTypes;
    value: string | number | FilterControl;
  };
  matchMode: MatchModes;
  rightHand?: {
    type: AssignmentTypes;
    value: string | number | FilterControl | Array<string> | Array<number>;
  };
  operator?: LogicOperators;
}

export type FilterControl = Pick<
  any,
  | 'fieldId'
  | 'dataSourceId'
  | 'relationshipIdsPath'
  | 'relationshipPath'
  | 'path'
  | 'pathPrefix'
>;

export interface FilterFeedData {
  leftHandAssignmentTypes?: typeof AssignmentTypes;
  leftHandControlProperties?: Array<FilterControl>;
  rightHandAssignmentTypes?: typeof AssignmentTypes;
  rightHandControlProperties?: Array<FilterControl>;
}

/**
 * Enum representing the available input types for menu filters.
 * These types define how the user can input data for filtering.
 */
export enum MenuFilterInputType {
  /**
   * A simple text input (e.g., string, keyword).
   */
  Text = 'text',

  /**
   * A single numeric input (e.g., quantity, price).
   */
  Number = 'number',

  /**
   * A range input for numbers (e.g., min and max values).
   */
  NumberRange = 'number-range',

  /**
   * A single date input (e.g., created at, due date).
   */
  Date = 'date',

  /**
   * A range input for dates (e.g., from - to).
   */
  DateRange = 'date-range',

  /**
   * A boolean input for true/false filters
   */
  Boolean = 'boolean',
}
