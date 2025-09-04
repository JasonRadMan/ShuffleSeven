import { useState } from 'react';
import { Copy, Mail, Phone, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

const INVITE_LINK = "https://shuffle7.app/invite/placeholder";

const inviteSchema = z.object({
  contactMethod: z.enum(['email', 'phone'], {
    required_error: 'Please select how you want to send the invitation',
  }),
  email: z.string().email('Please enter a valid email address').optional(),
  phone: z.string().min(10, 'Please enter a valid phone number').optional(),
}).refine(
  (data) => {
    if (data.contactMethod === 'email' && !data.email) {
      return false;
    }
    if (data.contactMethod === 'phone' && !data.phone) {
      return false;
    }
    return true;
  },
  {
    message: 'Please provide the required contact information',
    path: ['contactMethod'],
  }
);

type InviteData = z.infer<typeof inviteSchema>;

interface InviteFriendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InviteFriendModal({ open, onOpenChange }: InviteFriendModalProps) {
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const { toast } = useToast();

  const form = useForm<InviteData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      contactMethod: 'email',
      email: '',
      phone: '',
    },
  });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(INVITE_LINK);
      toast({
        title: "Link copied!",
        description: "The invite link has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInvite = (data: InviteData) => {
    // For now, just show success message and close modal
    toast({
      title: "Invitation sent!",
      description: `Invitation has been sent ${data.contactMethod === 'email' ? 'via email' : 'via SMS'}.`,
    });
    onOpenChange(false);
    form.reset();
  };

  const handleContactMethodChange = (value: string) => {
    const method = value as 'email' | 'phone';
    setContactMethod(method);
    form.setValue('contactMethod', method);
    // Clear the other field when switching
    if (method === 'email') {
      form.setValue('phone', '');
    } else {
      form.setValue('email', '');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="invite-modal">
        <DialogHeader>
          <DialogTitle className="text-center font-serif text-2xl text-primary">
            Invite a Friend
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Invite Link Section */}
          <div className="space-y-2">
            <Label htmlFor="invite-link">Share this link</Label>
            <div className="flex gap-2">
              <Input
                id="invite-link"
                value={INVITE_LINK}
                readOnly
                className="flex-1 bg-muted"
                data-testid="invite-link"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="px-3"
                data-testid="button-copy-link"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={form.handleSubmit(handleInvite)} className="space-y-4">
            <div className="space-y-3">
              <Label>Or send an invitation directly</Label>
              
              {/* Contact Method Selection */}
              <RadioGroup
                value={contactMethod}
                onValueChange={handleContactMethodChange}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email-method" />
                  <Label htmlFor="email-method" className="cursor-pointer">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone-method" />
                  <Label htmlFor="phone-method" className="cursor-pointer">SMS</Label>
                </div>
              </RadioGroup>

              {/* Email Input */}
              {contactMethod === 'email' && (
                <div>
                  <Label htmlFor="invite-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="friend@example.com"
                      className="pl-10"
                      data-testid="invite-input"
                      {...form.register('email')}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>
              )}

              {/* Phone Input */}
              {contactMethod === 'phone' && (
                <div>
                  <Label htmlFor="invite-phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="invite-phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="pl-10"
                      data-testid="invite-input"
                      {...form.register('phone')}
                    />
                  </div>
                  {form.formState.errors.phone && (
                    <p className="text-xs text-destructive mt-1">{form.formState.errors.phone.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
                data-testid="button-send-invite"
              >
                Send Invitation
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}