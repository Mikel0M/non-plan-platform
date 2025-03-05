import { ItoDo, toDo } from "./toDo"
import { currentProject } from './ProjectsManager'

export class toDoManager {
    list: toDo[] = []
    ui: HTMLElement

    constructor(container: HTMLElement) {
        this.ui = container
    }

    newtoDo(data: ItoDo) {
        const ToDo = new toDo(data)
        this.ui.append(ToDo.ui)
        this.list.push(ToDo)
        return ToDo
    }
}