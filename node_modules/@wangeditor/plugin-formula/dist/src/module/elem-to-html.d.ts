/**
 * @description elem to html
 * @author wangfupeng
 */
import { SlateElement } from '@wangeditor/editor';
declare function formulaToHtml(elem: SlateElement, childrenHtml: string): string;
declare const conf: {
    type: string;
    elemToHtml: typeof formulaToHtml;
};
export default conf;
