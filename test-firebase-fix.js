// Test script to verify project creation and todo operations
// Run this in the browser console to test the new structure

console.log("=== Testing Project Creation and Todo Operations ===");

// Test 1: Create a new project
console.log("\n1. Testing project creation...");
const testProjectData = {
    name: "Test Project Firebase Fix",
    description: "Testing the Firebase sync fix",
    status: "Active" as const,
    phase: "Design" as const,
    userRole: "Developer" as const,
    location: "Test Location",
    progress: 0,
    cost: 1000,
    startDate: "2024-01-01",
    finishDate: "2024-12-31",
    companyId: "test-company-id",
    createdBy: "test-user-id"
};

// Import the project manager
import { projectsManagerInstance } from './src/classes/ProjectsManager';

// Create a new project
projectsManagerInstance.newProject(testProjectData)
    .then((project) => {
        console.log("✅ Project created successfully:", project);
        
        // Test 2: Add a todo to the project
        console.log("\n2. Testing todo creation...");
        const testTodoData = {
            title: "Test Todo",
            description: "Testing the new todo structure",
            status: "Pending" as const,
            priority: "Medium" as const,
            project_id: project.id,
            assigned_to: "test-user-id",
            created_by: "test-user-id",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            due_date: "2024-06-01",
            start_date: "2024-01-01",
            completion_date: "",
            estimated_hours: 8,
            actual_hours: 0,
            dependencies: [],
            progress_percentage: "0%" as const,
            comments: [],
            isComplete: false,
            phase: "Design"
        };
        
        const newTodo = project.addToDo(testTodoData);
        console.log("✅ Todo added successfully:", newTodo);
        
        // Test 3: Test subToDo operations
        console.log("\n3. Testing subToDo operations...");
        const testSubToDo = {
            assignedTo: "test-user-id",
            description: "Test subtodo",
            endDate: "2024-06-01",
            isComplete: false,
            name: "Test SubTodo",
            startDate: "2024-01-01"
        };
        
        newTodo.setSubToDo(testSubToDo);
        console.log("✅ SubTodo set successfully:", newTodo.subToDo);
        
        // Test 4: Update subToDo
        newTodo.updateSubToDo({ isComplete: true });
        console.log("✅ SubTodo updated successfully:", newTodo.subToDo);
        
        // Test 5: Toggle todo completion
        newTodo.toggleComplete();
        console.log("✅ Todo completion toggled:", newTodo.isComplete);
        
        console.log("\n=== All tests completed successfully! ===");
        
    })
    .catch((error) => {
        console.error("❌ Project creation failed:", error);
    });
