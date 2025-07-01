"use server";

import {
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { prisma } from "@/lib/prisma";
import { ticketsPath } from "@/paths";
import { TicketStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const updateTicketStatus = async (id: string, value: TicketStatus) => {
  try {
    await prisma.ticket.update({
      where: {
        id,
      },
      data: {
        status: value,
      },
    });

    revalidatePath(ticketsPath());
  } catch (error) {
    return fromErrorToActionState(error);
  }

  return toActionState("SUCCESS", "Status Updated");
};
