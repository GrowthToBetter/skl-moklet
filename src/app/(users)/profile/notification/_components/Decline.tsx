"use client";
import { FormButton } from "@/app/components/utils/Button";
import { useRouter } from "next/navigation";
import React, { ChangeEvent } from "react";
import toast from "react-hot-toast";

export default function Decline({ reqId, teamId }: { reqId: string; teamId: string }) {
  const router = useRouter();
  const HandleDecline = async (e: ChangeEvent<any>) => {
    e.preventDefault();
    try {
      const confirmation = confirm("Are you sure to decline this team?");
      if (!confirmation) return;
    } catch (error) {
      console.error(error);
      toast.error((error as Error).message);
    }
  };
  return (
    <div>
      <FormButton onClick={HandleDecline} variant="white">
        Decline
      </FormButton>
    </div>
  );
}
