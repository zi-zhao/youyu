/**
 * @description render elem
 * @author wangfupeng
 */
import { VNode } from 'snabbdom';
import { IDomEditor, SlateElement } from '@wangeditor/editor';
declare function renderFormula(elem: SlateElement, children: VNode[] | null, editor: IDomEditor): VNode;
declare const conf: {
    type: string;
    renderElem: typeof renderFormula;
};
export default conf;
