// Debug script to check what data is being sent to Firebase
// Add this to the newProject method in ProjectsManager.ts to debug

console.log("=== DEBUG: Project creation data ===");
console.log("1. Input data to newProject:", data);

const project = new Project(data);
console.log("2. Project instance after construction:", project);

const jsonData = project.toJSON();
console.log("3. Data from toJSON() before Firebase:", jsonData);

// Check specific fields
console.log("4. Phase field:", jsonData.phase);
console.log("5. Phase type:", typeof jsonData.phase);
console.log("6. Phase undefined check:", jsonData.phase === undefined);

// Check toDos
console.log("7. toDos field:", jsonData.toDos);
console.log("8. toDos length:", jsonData.toDos?.length);

// Test a todo with subToDo
if (jsonData.toDos && jsonData.toDos.length > 0) {
    console.log("9. First todo:", jsonData.toDos[0]);
    console.log("10. First todo subToDo:", jsonData.toDos[0].subToDo);
}
