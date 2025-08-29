
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Share2, Check } from 'lucide-react';

export function ShareTrackingButton({ tripId }: { tripId: string }) {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const url = `${window.location.origin}/tracking/${tripId}`;
        navigator.clipboard.writeText(url).then(() => {
            toast({
                title: 'Link Copied!',
                description: 'The public tracking link has been copied to your clipboard.',
            });
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        });
    };

    return (
        <Button variant="outline" onClick={handleCopy}>
            {copied ? (
                <Check className="mr-2 h-4 w-4 text-green-500" />
            ) : (
                <Share2 className="mr-2 h-4 w-4" />
            )}
            {copied ? 'Copied' : 'Share Tracking'}
        </Button>
    );
}
