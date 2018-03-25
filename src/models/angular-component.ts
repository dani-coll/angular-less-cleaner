import { HtmlDom } from './html-dom'

export class AngularComponent {
	constructor(
        public selector: string = "",
        public template: string = "",
        public templateUrl: string = "",
        public fullPath: string = "",
        public dom: HtmlDom = new HtmlDom()
	) {}
}