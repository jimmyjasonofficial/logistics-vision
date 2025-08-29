
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { listAllAttachments } from '@/services/storage-service';
import { DocumentManager } from './document-manager';

export default async function DocumentsPage() {
    // Fetch initial list of documents from Firebase Storage
    const files = await listAllAttachments();

    return (
        <div className="flex-1 space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Document Hub</h1>
                    <p className="text-muted-foreground">View and manage all documents across your system.</p>
                </div>
            </div>
            
            <DocumentManager initialFiles={files} />
        </div>
    );
}
