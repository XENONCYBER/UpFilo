import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
  
import { useCreateChannelModal } from '@/features/channels/store/use-create-channel-modal';
import { useCreateChannel } from '../api/use-create-channels';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';


  export const CreateChannelModal = () => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();

    const [open, setOpen] = useCreateChannelModal();

    const { mutate, isPending } = useCreateChannel();

    const [name, setName] = useState('');

    const handleClose = () => {
        setName("");    
        setOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
        setName(value);
    };

    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        mutate({name, workspaceId},{
         onSuccess(id) {
            toast.success("Channel created successfully");
             router.push(`/workspace/${workspaceId}/channel/${id}`);
             handleClose();
         },
         onError: () => {
             toast.error("Failed to create channel");
         },
        })
     }
  
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add a channel</DialogTitle>
            </DialogHeader>
            <form className='space-y-4' onSubmit={handleSubmit}>
                <Input
                    value={name}
                    disabled={isPending}
                    onChange={handleChange}
                    required
                    autoFocus
                    minLength={3}
                    maxLength={80}
                    placeholder='Channel name' />
                <div className="flex justify-end">
                    <Button disabled={isPending}>
                        Create
                    </Button>
                </div>
            </form>
        </DialogContent>
      </Dialog>
    );
  }