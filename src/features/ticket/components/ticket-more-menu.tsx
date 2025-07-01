"use client";

import { Ticket, TicketStatus } from "@prisma/client";
import { LucideMoreVertical, LucideTrash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TICKET_STATUS_LABELS } from "../constants";
import { updateTicketStatus } from "../actions/update-ticket-status";
import { toast } from "sonner";
import ConfirmDialog from "@/components/cofirm-dialog";
import { Button } from "@/components/ui/button";
import { deleteTicket } from "../actions/delete-ticket";
import useConfirmDialog from "@/components/cofirm-dialog";

type TicketsMoreMenuProps = {
  ticket: Ticket;
  trigger: React.ReactNode;
};

const TicketsMoreMenu = ({ ticket, trigger }: TicketsMoreMenuProps) => {
  const [deleteButton, deleteDialog] = useConfirmDialog({
    action: deleteTicket.bind(null, ticket.id),
    trigger: (
      <Button variant="ghost" size="sm" className="justify-start w-full h-auto p-2 text-destructive hover:text-destructive">
        <LucideTrash className="h-4 w-4 mr-2" />
        Delete
      </Button>
    ),
  });

  const handleStatusChange = async (value: string) => {
    const promise = updateTicketStatus(ticket.id, value as TicketStatus);

    toast.promise(promise, {
      loading: "Updating Status ...",
    });

    const result = await promise;

    if (result.status === "ERROR") {
      toast.error("Unable to update the ticket");
    } else if (result.status === "SUCCESS") {
      toast.success("Status Updated");
    }
  };
  return (
    <>
      {deleteDialog}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={ticket.status}
            onValueChange={handleStatusChange}
          >
            {(Object.keys(TICKET_STATUS_LABELS) as Array<TicketStatus>).map(
              (key) => (
                <DropdownMenuRadioItem key={key} value={key}>
                  {TICKET_STATUS_LABELS[key]}
                </DropdownMenuRadioItem>
              )
            )}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>{deleteButton}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
export default TicketsMoreMenu;
