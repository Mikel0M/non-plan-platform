import { ItoDo } from '../classes/toDo';

// Helper to populate user selects (copy from index.tsx if needed)
function populateUserSelects() {
    // Dummy implementation, replace with your actual logic
    // This should populate the user select dropdowns in the modal
}

export function showModalPopulated(id: string, toDo: ItoDo) {
    const modal = document.getElementById(id);
    if (modal && modal instanceof HTMLDialogElement) {
        populateUserSelects();
        (document.getElementById("editToDoId") as HTMLInputElement).value = toDo.id ?? '';
        (document.getElementById("editToDoTitle") as HTMLInputElement).value = toDo.title;
        (document.getElementById("editToDoDescription") as HTMLTextAreaElement).value = toDo.description;
        (document.getElementById("editToDoStatus") as HTMLSelectElement).value = toDo.status;
        (document.getElementById("editToDoPriority") as HTMLSelectElement).value = toDo.priority;
        (document.getElementById("editToDoAssignedTo") as HTMLSelectElement).value = toDo.assigned_to;
        (document.getElementById("editToDoCreatedBy") as HTMLSelectElement).value = toDo.created_by;
        (document.getElementById("editToDoStartDate") as HTMLInputElement).value = toDo.start_date;
        (document.getElementById("editToDoUpdatedAt") as HTMLInputElement).value = toDo.updated_at;
        (document.getElementById("editToDoEstimatedHours") as HTMLInputElement).value = toDo.estimated_hours.toString();
        (document.getElementById("editToDoActualHours") as HTMLInputElement).value = toDo.actual_hours.toString();
        (document.getElementById("editToDoDueDate") as HTMLInputElement).value = toDo.due_date;
        (document.getElementById("editToDoDependencies") as HTMLInputElement).value = toDo.dependencies.join(", ");
        (document.getElementById("editToDoComments") as HTMLTextAreaElement).value = toDo.comments.join(", ");
        modal.showModal();
    } else {
        console.warn("The provided modal wasn't found. ID: ", id);
    }
}
