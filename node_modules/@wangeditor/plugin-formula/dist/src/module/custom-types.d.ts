/**
 * @description formula element
 * @author wangfupeng
 */
declare type EmptyText = {
    text: '';
};
export declare type FormulaElement = {
    type: 'formula';
    value: string;
    children: EmptyText[];
};
export {};
