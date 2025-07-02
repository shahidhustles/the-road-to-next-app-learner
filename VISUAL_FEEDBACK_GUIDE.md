# Visual Feedback & Form Flow Guide

This document explains the visual feedback system and form flow architecture in this Next.js application.

## 🎯 Overview

The application uses two distinct feedback mechanisms depending on the user flow:

1. **ActionState + useActionFeedback**: For same-page interactions with rich feedback
2. **Cookies + RedirectToast**: For cross-page interactions with simple notifications

## 🍪 Cookie-Based Feedback

### When to Use

- **Redirecting to a different page** after an action
- **Simple success messages** (no validation errors needed)
- **Non-sensitive data** only (just messages, no form payload)

### How It Works

```
Action → Set Cookie → Redirect → New Page → Show Toast → Delete Cookie
```

### Implementation Example

```typescript
// In server action (e.g., upsert-ticket.ts)
if (id) {
  await setCookieByKey("toast", "Ticket updated");
  redirect(ticketPath(id)); // Redirect to ticket detail page
}
```

### Key Components

- **`/src/actions/cookies.ts`**: Cookie management utilities
- **`/src/components/redirect-toast.tsx`**: Reads cookies and shows toasts on new pages
- **`/src/app/template.tsx`**: Includes RedirectToast globally

### RedirectToast Component Flow

```typescript
// Automatically runs on every page navigation
useEffect(() => {
  const showCookieToast = async () => {
    const message = await getCookieByKey("toast");
    if (message) {
      toast.success(message);
      await deleteCookieByKey("toast");
    }
  };
  showCookieToast();
}, [pathname]);
```

## 🎯 ActionState-Based Feedback

### When to Use

- **Staying on the same page** after form submission
- **Rich validation feedback** needed (field-level errors)
- **Sensitive data** in payload (form values for re-population)
- **Complex state management** (form resets, conditional logic)

### How It Works

```
Form Submit → Process → Return ActionState → useActionFeedback → Toast + Callbacks
```

### ActionState Structure

```typescript
type ActionState = {
  status?: "SUCCESS" | "ERROR";
  message: string;
  payload?: FormData; // Sensitive form data
  fieldErrors: Record<string, string[] | undefined>;
  timestamp: number; // For change detection
};
```

### Implementation Example

```typescript
// In server action
return toActionState("SUCCESS", "Ticket created");

// In component
const [actionState, action] = useActionState(
  upsertTicket.bind(null, ticket?.id),
  EMPTY_ACTION_STATE
);
```

### Key Components

- **`/src/components/form/form.tsx`**: Main form wrapper with ActionState handling
- **`/src/components/form/hooks/use-action-feedback.ts`**: Detects state changes
- **`/src/components/form/utils/to-action-state.ts`**: ActionState utilities

## 📊 Complete Flow Examples

### Scenario 1: Creating New Ticket (ActionState)

```
1. User fills form → Submit
2. upsertTicket() processes data
3. Validation error?
   ├─ YES: Return ActionState with fieldErrors
   │       └─ Form shows validation errors
   └─ NO: Return ActionState("SUCCESS", "Ticket created")
           └─ useActionFeedback triggers toast.success()
           └─ onSuccess callback resets form (DatePicker, etc.)
```

**Code Flow:**

```typescript
// Server Action
export const upsertTicket = async (id, _actionState, formData) => {
  try {
    // Process data...
    if (!id) {
      return toActionState("SUCCESS", "Ticket created"); // Stay on page
    }
  } catch (error) {
    return fromErrorToActionState(error, formData); // Show validation
  }
};

// Component
const handleSuccess = () => {
  datePickerImperativeHandleRef.current?.reset(); // Reset form
};

<Form action={action} actionState={actionState} onSuccess={handleSuccess}>
```

### Scenario 2: Editing Existing Ticket (Cookie)

```
1. User edits ticket → Submit
2. upsertTicket() processes data
3. Validation error?
   ├─ YES: Return ActionState with fieldErrors
   │       └─ Form shows validation errors
   └─ NO: setCookieByKey("toast", "Ticket updated")
           └─ redirect(ticketPath(id))
           └─ New page loads
           └─ RedirectToast reads cookie → toast.success()
```

**Code Flow:**

```typescript
// Server Action
export const upsertTicket = async (id, _actionState, formData) => {
  try {
    // Process data...
    if (id) {
      await setCookieByKey("toast", "Ticket updated");
      redirect(ticketPath(id)); // Go to ticket detail page
    }
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};
```

### Scenario 3: Deleting Ticket (Cookie)

```
1. User clicks delete → Confirm
2. deleteTicket() removes record
3. setCookieByKey("toast", "Ticket deleted")
4. redirect(ticketsPath()) → Go to tickets list
5. RedirectToast shows success message
```

## 🔧 Component Architecture

### Form Component

```typescript
// Handles ActionState feedback for same-page interactions
const Form = ({ action, actionState, children, onSuccess, onError }) => {
  useActionFeedback(actionState, {
    onSuccess: ({ actionState }) => {
      if (actionState.message) {
        toast.success(actionState.message);
      }
      onSuccess?.(actionState);
    },
    onError: ({ actionState }) => {
      if (actionState.message) {
        toast.error(actionState.message);
      }
      onError?.(actionState);
    },
  });

  return <form action={action}>{children}</form>;
};
```

### useActionFeedback Hook

```typescript
// Detects ActionState changes and triggers callbacks
const useActionFeedback = (actionState, options) => {
  const prevTimestamp = useRef(actionState.timestamp);
  const isUpdate = prevTimestamp.current !== actionState.timestamp;

  useEffect(() => {
    if (!isUpdate) return;

    if (actionState.status === "SUCCESS") {
      options.onSuccess?.({ actionState });
    }
    if (actionState.status === "ERROR") {
      options.onError?.({ actionState });
    }

    prevTimestamp.current = actionState.timestamp;
  }, [isUpdate, actionState, options]);
};
```

## 🎯 Decision Matrix

| Scenario                   | Feedback Type | Reason                                      | Example                      |
| -------------------------- | ------------- | ------------------------------------------- | ---------------------------- |
| **Creating new item**      | ActionState   | Stay on page, validation needed, form reset | New ticket form              |
| **Editing existing item**  | Cookie        | Redirect to detail page, simple success     | Edit ticket → ticket detail  |
| **Deleting item**          | Cookie        | Redirect to list, simple notification       | Delete ticket → tickets list |
| **Form validation errors** | ActionState   | Field-level errors, sensitive payload       | Any form with validation     |
| **Authentication actions** | Cookie        | Redirect after login/logout                 | Sign in → dashboard          |

## 🔍 Key Insights

### Why Two Systems?

1. **ActionState System**:

   - Rich, immediate feedback
   - Handles validation errors gracefully
   - Maintains form state and sensitive data
   - Perfect for complex forms that stay on the same page

2. **Cookie System**:
   - Simple, cross-page notifications
   - Works seamlessly with redirects
   - No sensitive data concerns
   - Easy to implement for basic CRUD operations

### The Golden Rule

**Where does the user end up after the action?**

- **Same page** = ActionState + useActionFeedback
- **Different page** = Cookie + RedirectToast

## 🛠 File Structure

```
src/
├── actions/
│   └── cookies.ts                    # Cookie utilities
├── components/
│   ├── form/
│   │   ├── form.tsx                  # Main form component
│   │   ├── hooks/
│   │   │   └── use-action-feedback.ts # Change detection hook
│   │   └── utils/
│   │       └── to-action-state.ts    # ActionState utilities
│   └── redirect-toast.tsx            # Cross-page notifications
├── app/
│   └── template.tsx                  # Global RedirectToast setup
└── features/
    └── ticket/
        └── actions/
            ├── upsert-ticket.ts      # Mixed feedback example
            └── delete-ticket.ts      # Cookie feedback example
```

## 💡 Best Practices

1. **Keep cookies simple**: Only store non-sensitive messages
2. **Use ActionState for validation**: Always return proper error states
3. **Reset forms on success**: Use onSuccess callbacks for cleanup
4. **Consistent error handling**: Use `fromErrorToActionState` for validation errors
5. **Timestamp-based detection**: Ensures useActionFeedback only triggers on actual changes

This architecture provides a clean separation of concerns and handles both simple notifications and complex form interactions elegantly.
