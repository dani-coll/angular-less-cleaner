export enum ElementType {
    Undefined,
    All,
    Id,
    Class,
    Tag
}


export class LessElement {
	constructor(
        public name: string = "",
        public fullName: string = "",
        public type: ElementType = ElementType.Undefined,
        public children: LessElement[] = [],
        public startRow: number = -1,
        public startColumn: number = -1,
        public endRow: number = -1,
        public endColumn: number = -1,
        public parent: LessElement | undefined = undefined,
        public littleBrothers: LessElement[] = [],

	) {}
}