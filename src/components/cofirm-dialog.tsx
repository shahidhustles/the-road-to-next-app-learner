import { cloneElement, useActionState, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form } from "./form/form";
import { SubmitButton } from "./form/submit-button";
import { ActionState, EMPTY_ACTION_STATE } from "./form/utils/to-action-state";

type UseConfirmDialogProps = {
  title?: string;
  description?: string;
  //ReactNode allows undefined, null too. So no need here
  trigger: React.ReactElement<unknown>;
  action: () => Promise<ActionState>;
};

const useConfirmDialog = ({
  trigger,
  action,
  title,
  description,
}: UseConfirmDialogProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // we need to make our own controlled component cause Dialog Trigger should be inside Dialog comp itself.
 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dialogTrigger = cloneElement(trigger as React.ReactElement<any>, {
    onClick: () => setIsOpen((state) => !state),
  });

  // toast notification for delete comes from cookies not from useActionFeedback and the whole loop.
  const [actionState, formAction] = useActionState(action, EMPTY_ACTION_STATE);

  const dialog = (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title ?? "Are you absolutely sure?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description ??
              "This action cannot be undone. Make sure you understand this consequences."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Form actionState={actionState} action={formAction}>
              <SubmitButton label="Continue" />
            </Form>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return [dialogTrigger, dialog];
};
export default useConfirmDialog;
