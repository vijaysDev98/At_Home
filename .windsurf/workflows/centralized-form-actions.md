---
description: How to use centralized form action handlers
---

# Centralized Form Action Handlers

All form action handlers are now centralized in `formActionHandlers.ts` to eliminate duplication across forms.

## Available Handlers

### 1. `handleFormSubmit()` - Submit Form (Create or Update)
Replaces: `validateAndSubmit`, `handleSubmitRequest`

**When to use:**
- First-time form submission (creates new request + submits for review)
- Submitting an existing draft for review

**Usage in form:**
```typescript
import { handleFormSubmit } from './formActionHandlers';

const validateAndSubmit = async () => {
  await handleFormSubmit({
    dispatch,
    state,
    initialData,
    serviceId,
    selectedPatient,
    validateForm,
    scrollRef,
    lastFirstErrorKey,
    errors,
  });
};

// Expose via useImperativeHandle
useImperativeHandle(ref, () => ({
  validateAndSubmit,
  // ... other methods
}));
```

### 2. `handleSaveAsDraft()` - Save as Draft
Replaces: `saveAsDraft`, `handleSaveAsDraft`

**When to use:**
- Save form without submitting (creates new request or updates existing)
- User wants to continue later

**Usage in form:**
```typescript
import { handleSaveAsDraft } from './formActionHandlers';

const saveAsDraft = async () => {
  await handleSaveAsDraft({
    dispatch,
    state,
    initialData,
    serviceId,
    selectedPatient,
    validateForm,
    scrollRef,
    lastFirstErrorKey,
    errors,
  });
};

useImperativeHandle(ref, () => ({
  saveAsDraft,
  // ... other methods
}));
```

### 3. `handleUpdateAndSign()` - Update & Prepare for Signing
Replaces: `updateAndSign`, `handleUpdateAndSign`

**When to use:**
- Update an already-submitted form (before signing)
- Form is in RETURNED status and needs re-edit

**Usage in form:**
```typescript
import { handleUpdateAndSign } from './formActionHandlers';

const updateAndSign = async () => {
  return await handleUpdateAndSign({
    dispatch,
    state,
    initialData,
    validateForm,
    scrollRef,
    lastFirstErrorKey,
    errors,
  });
};

useImperativeHandle(ref, () => ({
  updateAndSign,
  // ... other methods
}));
```

### 4. `handleSaveProgress()` - Provider Save Progress
Replaces: `saveProgress`

**When to use:**
- Provider saving pre-claim form progress (not submitting)
- Provider wants to continue later

**Usage in form:**
```typescript
import { handleSaveProgress } from './formActionHandlers';

const saveProgress = async () => {
  return await handleSaveProgress({
    dispatch,
    state,
    initialData,
    validateForm,
    scrollRef,
    lastFirstErrorKey,
    errors,
  });
};

useImperativeHandle(ref, () => ({
  saveProgress,
  // ... other methods
}));
```

## Migration Steps

For each form (CNOForm, FreePrescriptionForm, etc.):

1. **Import the handlers:**
   ```typescript
   import {
     handleFormSubmit,
     handleSaveAsDraft,
     handleUpdateAndSign,
     handleSaveProgress,
   } from './formActionHandlers';
   ```

2. **Remove duplicate handler functions** (e.g., `handleSubmitRequest`, `handleSaveAsDraft`)

3. **Create wrapper functions** that call the centralized handlers with form-specific params:
   ```typescript
   const validateAndSubmit = async () => {
     await handleFormSubmit({
       dispatch,
       state,
       initialData,
       serviceId,
       selectedPatient,
       validateForm,
       scrollRef,
       lastFirstErrorKey,
       errors,
     });
   };
   ```

4. **Expose via useImperativeHandle:**
   ```typescript
   useImperativeHandle(ref, () => ({
     validateAndSubmit,
     saveAsDraft,
     updateAndSign,
     saveProgress,
     getFormData: () => state,
   }));
   ```

## Benefits

✅ **DRY Principle**: Single source of truth for all action logic  
✅ **Consistency**: Same behavior across all forms  
✅ **Maintainability**: Bug fixes apply to all forms automatically  
✅ **Reduced Code**: ~200 lines of duplicate code eliminated per form  
✅ **Easier Testing**: Test handlers once, applies to all forms

## Example: Complete FreePrescriptionForm Migration

```typescript
import { handleFormSubmit, handleSaveAsDraft, handleUpdateAndSign, handleSaveProgress } from './formActionHandlers';

const FreePrescriptionForm = forwardRef<FreePrescriptionFormRef, FreePrescriptionFormProps>(
  ({ serviceId, initialData, patient, readOnly = false }, ref) => {
    const dispatch = useDispatch();
    const reduxPatient = useSelector((state: RootState) => state.patient.selectedPatient);
    const selectedPatient = initialData ? patient : reduxPatient;
    const scrollViewRef = useRef<ScrollView>(null);
    const lastFirstErrorKey = useRef<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [state, setState] = useState({ /* ... */ });

    const validateForm = (): boolean => { /* ... */ };

    // Centralized action handlers
    const validateAndSubmit = async () => {
      await handleFormSubmit({
        dispatch,
        state,
        initialData,
        serviceId,
        selectedPatient,
        validateForm,
        scrollRef: scrollViewRef,
        lastFirstErrorKey,
        errors,
      });
    };

    const saveAsDraft = async () => {
      await handleSaveAsDraft({
        dispatch,
        state,
        initialData,
        serviceId,
        selectedPatient,
        validateForm,
        scrollRef: scrollViewRef,
        lastFirstErrorKey,
        errors,
      });
    };

    const updateAndSign = async () => {
      return await handleUpdateAndSign({
        dispatch,
        state,
        initialData,
        validateForm,
        scrollRef: scrollViewRef,
        lastFirstErrorKey,
        errors,
      });
    };

    const saveProgress = async () => {
      return await handleSaveProgress({
        dispatch,
        state,
        initialData,
        validateForm,
        scrollRef: scrollViewRef,
        lastFirstErrorKey,
        errors,
      });
    };

    useImperativeHandle(ref, () => ({
      validateAndSubmit,
      saveAsDraft,
      updateAndSign,
      saveProgress,
      getFormData: () => state,
    }));

    return (
      // ... JSX
    );
  }
);
```

## Files to Update

- [ ] FreePrescriptionForm.tsx
- [ ] CNOForm.tsx
- [ ] HydrationInfusion.tsx
- [ ] MedicalOxygen.tsx
- [ ] PcaForm.tsx
- [ ] PersonalHygieneCare.tsx
- [ ] PregnancyCareForm.tsx
- [ ] WoundCareForm.tsx
- [ ] ArtificialNutritionForm.tsx
- [ ] AntibiotherapyInfusionForm.tsx
