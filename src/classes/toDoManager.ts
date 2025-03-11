import { ItoDo, toDo } from "./toDo";

export class toDoManager {
    list: toDo[] = [];
    ui: HTMLElement;

    constructor(container: HTMLElement) {
        this.ui = container;
    }

    newToDo(data: ItoDo) {
        const ToDo = new toDo(data);
        this.ui.append(ToDo.ui);
        this.list.push(ToDo);
        return ToDo;
    }
}