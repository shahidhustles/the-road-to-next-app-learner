import { toast } from "sonner";
import { useActionFeedback } from "./hooks/use-action-feedback";
import { ActionState } from "./utils/to-action-state";

type FormProps = {
  action: (payload: FormData) => void;
  actionState: ActionState;
  children: React.ReactNode;
  onSuccess?: (actionState: ActionState) => void;
  onError?: (actionState: ActionState) => void;
};

const Form = ({
  action,
  actionState,
  children,
  onSuccess,
  onError,
}: FormProps) => {
  // this will call the toast notification and reset the datepicker.
  //the reason we are not doing it directly here is because it requires useEffect for checking if the actionState has changed

  //this block is only useful when you are returning :
  // toActionState("SUCCESS" or "ERROR" with the message "Ticket Created / Ticket Edited")
  // for other things as you know we are using cookies.
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

  return (
    <form action={action} className="flex flex-col gap-y-2">
      {children}
    </form>
  );
};

export { Form };


// When do we use cookies vs when do we use our own useActionFeedback : 
// use cookies when you are redirecting them to a different page. and there you need to show the message. 
// you dont need to have two way visual feedback like toast + form validation as we do in useactionFeedback. 
// we are also returning a payload which is sensetive data cant be a cookie. 
// cookies is easier to setup. 

