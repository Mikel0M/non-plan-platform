# Firestore Structure Fixes

## Issues Fixed

### 1. **SubToDo Structure Mismatch**
**Problem**: The `ISubToDo` interface was incorrectly defined as an array with complex fields that didn't match Firestore.

**Solution**: Updated to match the actual Firestore structure:
```typescript
// OLD (incorrect)
export interface ISubToDo {
    isComplete: boolean;
    title: string;
    description: string;
    assignedTo: string;
    createdBy: string;
    createdAt: string;
    dueDate: string;
    estimatedHours: number;
    actualHours: number;
    priority: toDoPriority;
    progressPercentage: toDoPercentage;
    comments: string[];
}

// NEW (correct)
export interface ISubToDo {
    assignedTo: string;
    description: string;
    endDate: string | Date;      // Firestore shows timestamp
    isComplete: boolean;
    name: string;                // Firestore uses 'name', not 'title'
    startDate: string | Date;    // Firestore shows timestamp
}
```

### 2. **SubToDo is Single Object, Not Array**
**Problem**: Code was treating `subToDo` as an array when it's actually a single object in Firestore.

**Solution**: 
- Changed interface: `subToDo?: ISubToDo[]` → `subToDo?: ISubToDo`
- Updated class property: `subToDo: ISubToDo[]` → `subToDo?: ISubToDo`
- Updated methods:
  - `addSubToDo()` → `setSubToDo()`
  - `updateSubToDo(index, data)` → `updateSubToDo(data)`
  - `removeSubToDo(index)` → `removeSubToDo()`

### 3. **Missing Phase Field**
**Problem**: The `phase` field was missing from the `ItoDo` interface.

**Solution**: Added `phase?: string` to both interface and class.

### 4. **Undefined Values in Firebase**
**Problem**: Firebase doesn't accept `undefined` values, causing `updateDoc()` errors.

**Solution**: Added `cleanForFirebase()` utility function to remove `undefined` values:
```typescript
function cleanForFirebase(obj: any): any {
    if (obj === null || obj === undefined) {
        return null;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => cleanForFirebase(item));
    }
    
    if (typeof obj === 'object') {
        const cleaned: any = {};
        for (const key in obj) {
            if (obj[key] !== undefined) {
                cleaned[key] = cleanForFirebase(obj[key]);
            }
        }
        return cleaned;
    }
    
    return obj;
}
```

### 5. **Missing Fields in ProjectsManager Validation**
**Problem**: The `validateUpdates()` method wasn't including `modifiedAt` and `modifiedBy` fields.

**Solution**: Added these fields to the validation:
```typescript
if (updates.modifiedAt !== undefined) validated.modifiedAt = updates.modifiedAt;
if (updates.modifiedBy !== undefined) validated.modifiedBy = updates.modifiedBy;
```

## Files Updated

### Core Classes
1. **src/classes/toDo.ts**
   - Updated `ISubToDo` interface to match Firestore structure
   - Changed `subToDo` from array to single object
   - Added `phase` field
   - Added `cleanForFirebase()` utility
   - Updated `toJSON()` to clean undefined values
   - Updated subToDo management methods

2. **src/classes/Project.ts**
   - Added `cleanForFirebase()` utility
   - Updated `toJSON()` to clean undefined values

3. **src/classes/ProjectsManager.ts**
   - Added `modifiedAt` and `modifiedBy` to `validateUpdates()`
   - Ensured timestamps are always updated on changes

### Hooks
4. **src/hooks/useTodos.ts**
   - Added `phase` field to todo mapping in both single-project and all-projects scenarios

## Expected Behavior

### Before Fix
- ❌ Firebase error: "Function updateDoc() called with invalid data. Unsupported field value: undefined"
- ❌ SubToDo structure mismatch
- ❌ Missing phase field in todos

### After Fix
- ✅ No undefined values sent to Firebase
- ✅ SubToDo structure matches Firestore exactly
- ✅ Phase field properly included in todos
- ✅ Clean serialization for Firebase operations
- ✅ Proper validation of all fields before Firebase updates

## Testing Checklist

1. **Create New Project**: Should work without Firebase errors
2. **Add Todo**: Should include all fields including `phase`
3. **Update Todo**: Should handle `subToDo` as single object
4. **Project Updates**: Should include `modifiedAt` and `modifiedBy`
5. **Completion Toggle**: Should work with new structure
6. **Firebase Sync**: Should not send undefined values

## Data Structure Compliance

The code now perfectly matches the Firestore structure:

### Todo Structure:
```
toDos (array)
  0 (map)
    actual_hours: 0 (number)
    assigned_to: "" (string)
    comments: [] (array)
    completion_date: "" (string)
    created_at: "2025-07-09T20:29:29.511Z" (string)
    created_by: "" (string)
    dependencies: [] (array)
    description: "DefaultToDoDescription" (string)
    due_date: "" (string)
    estimated_hours: 0 (number)
    id: "1752092969511" (string)
    isComplete: false (boolean)
    phase: "DefaultToDoPhase" (string)
    priority: "Medium" (string)
    progress_percentage: "25%" (string)
    project_id: "Th7CMgZq42P4CsaeQXAE" (string)
    start_date: "" (string)
    status: "Pending" (string)
    subToDo: (map)
      assignedTo: "defaultSubToDOAssignedTo" (string)
      description: "defaultSubToDODescription" (string)
      endDate: 15 July 2025 at 00:00:00 UTC+2 (timestamp)
      isComplete: false (boolean)
      name: "defaultSubToDOName" (string)
      startDate: 15 July 2025 at 00:00:00 UTC+2 (timestamp)
    title: "defaultToDo" (string)
    updated_at: "2025-07-15T08:07:49.002Z" (string)
    updatedAt: "2025-07-15T08:07:49.004Z" (string)
```

All fields are now properly typed and handled, with no undefined values being sent to Firebase.
