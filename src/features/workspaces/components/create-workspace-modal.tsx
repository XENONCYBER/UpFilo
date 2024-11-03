"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import { useCreateWorkspaceModal } from '../store/use-create-workspace-modal';
import { useCreateWorkspace } from '../api/use-create-workspaces';

export const CreateWorkspaceModal = () => {
    const router = useRouter();

    const [open, setOpen] = useCreateWorkspaceModal();
    const [name, setName] = useState("");

    const { mutate, isPending } = useCreateWorkspace(); 
    
    const handleClose = () => {
        setOpen(false);
        setName("");
    };

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
       e.preventDefault();
       
       mutate({name},{
        onSuccess(id) {
            toast.success("Workspace created successfully");
            router.push(`/workspace/${id}`);
            handleClose();
        },
       })
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add a new workspace</DialogTitle>
                    <DialogDescription>
                        Workspaces are where you can organize your projects and collaborate with your team.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isPending}
                      required
                      autoFocus
                      minLength={3}
                      placeholder='Workspace name' 
                    />
                    <div className="flex justify-end">
                        <Button disabled={isPending}>
                            Create workspace
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};