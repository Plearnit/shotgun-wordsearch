
export default class EventHandler extends EventTarget {

    constructor() {
        super();
    }

    public fireEvent(event: Event ): void {
        console.log(event);
        this.dispatchEvent(event);
    }
}