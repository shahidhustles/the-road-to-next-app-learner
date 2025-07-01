import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { cloneElement, useState } from "react";

type UseConfirmDialogProps = {
  title?: string;
  description?: string;
  //ReactNode allows undefined, null too. So no need here
  trigger: React.ReactElement<any>;
  action: () => Promise<void>;
};

const useConfirmDialog = ({
  trigger,
  action,
  title,
  description,
}: UseConfirmDialogProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // we need to make our own controlled component cause Dialog Trigger should be inside Dialog comp itself.
  const dialogTrigger = cloneElement(trigger as React.ReactElement<any>, {
    onClick: () => setIsOpen((state) => !state),
  });

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
            <form action={action}>
              <Button type="submit">Continue</Button>
            </form>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return [dialogTrigger, dialog];
};
export default useConfirmDialog;
