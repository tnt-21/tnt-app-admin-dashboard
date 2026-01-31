'use client';

import { use, useState, useRef, useEffect } from 'react';
import { 
    useSupportTicket, useUpdateTicketStatus, 
    useAssignTicket, useAddTicketMessage 
} from '@/hooks/use-support';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
    ArrowLeft, Send, Paperclip, 
    MoreVertical, User, Clock,
    AlertCircle, CheckCircle2,
    Lock, MessageSquare, Info,
    ChevronDown, UserPlus,
    Calendar, Mail, Phone,
    Hash, Tag, Link as LinkIcon
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { 
    DropdownMenu, DropdownMenuContent, 
    DropdownMenuItem, DropdownMenuTrigger,
    DropdownMenuSeparator, DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data, isLoading } = useSupportTicket(id);
    const updateStatus = useUpdateTicketStatus();
    const assignTicket = useAssignTicket();
    const addMessage = useAddTicketMessage();

    const [reply, setReply] = useState('');
    const [isInternal, setIsInternal] = useState(false);

    const ticket = data?.ticket;
    const messages = data?.messages || [];

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!reply.trim()) return;
        
        await addMessage.mutateAsync({
            id,
            data: {
                message: reply,
                is_internal: isInternal
            }
        });
        
        setReply('');
    };

    const handleStatusChange = (status: string) => {
        updateStatus.mutate({ id, data: { status } });
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading ticket details...</div>;
    if (!ticket) return <div className="p-8 text-center text-red-500">Ticket not found</div>;

    const statusVariants: Record<string, string> = {
        open: 'bg-green-100 text-green-700 border-green-200',
        in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
        waiting_customer: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        resolved: 'bg-purple-100 text-purple-700 border-purple-200',
        closed: 'bg-gray-100 text-gray-700 border-gray-200'
    };

    const priorityVariants: Record<string, string> = {
        urgent: 'bg-red-100 text-red-700 border-red-200',
        high: 'bg-orange-100 text-orange-700 border-orange-200',
        medium: 'bg-blue-100 text-blue-700 border-blue-200',
        low: 'bg-gray-100 text-gray-700 border-gray-200'
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/support/tickets">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-bold font-mono text-blue-600">{ticket.ticket_number}</span>
                            <Badge variant="outline" className={cn("capitalize", statusVariants[ticket.status])}>
                                {ticket.status?.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className={cn("capitalize", priorityVariants[ticket.priority])}>
                                {ticket.priority}
                            </Badge>
                        </div>
                        <h1 className="text-lg font-semibold">{ticket.subject}</h1>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                Change Status
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Ticket Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleStatusChange('open')}>Mark as Open</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange('in_progress')}>In Progress</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange('waiting_customer')}>Waiting for Customer</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange('resolved')} className="text-purple-600">Resolve Ticket</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange('closed')} className="text-gray-500">Close Ticket</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" size="icon">
                        <UserPlus className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex gap-4 overflow-hidden">
                {/* Main Content: Chat */}
                <Card className="flex-1 flex flex-col border-none shadow-sm overflow-hidden">
                    <CardHeader className="border-b py-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-primary" />
                            Conversation History
                        </CardTitle>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            Created {format(new Date(ticket.created_at), 'MMM dd, HH:mm')}
                        </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                {/* Original Description */}
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                        <User className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold">{ticket.user_name}</span>
                                            <span className="text-[10px] text-muted-foreground">Original Request</span>
                                        </div>
                                        <div className="bg-blue-50/50 rounded-2xl rounded-tl-none p-4 text-sm border border-blue-100/50">
                                            {ticket.description}
                                        </div>
                                    </div>
                                </div>

                                {messages.map((msg: any) => (
                                    <div key={msg.message_id} className={cn(
                                        "flex gap-3",
                                        msg.sender_type === 'admin' ? "flex-row-reverse" : ""
                                    )}>
                                        <div className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                            msg.sender_type === 'admin' 
                                                ? (msg.is_internal ? "bg-orange-100" : "bg-primary/10") 
                                                : "bg-blue-100"
                                        )}>
                                            {msg.sender_type === 'admin' ? (
                                                <div className="h-full w-full rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold uppercase">
                                                    {msg.sender_name?.split(' ').map((n: string) => n[0]).join('')}
                                                </div>
                                            ) : (
                                                <User className="h-4 w-4 text-blue-600" />
                                            )}
                                        </div>
                                        <div className={cn(
                                            "max-w-[80%] space-y-1",
                                            msg.sender_type === 'admin' ? "items-end" : ""
                                        )}>
                                            <div className={cn(
                                                "flex items-center gap-2",
                                                msg.sender_type === 'admin' ? "flex-row-reverse" : ""
                                            )}>
                                                <span className="text-sm font-bold">{msg.sender_name}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {format(new Date(msg.created_at), 'HH:mm')}
                                                </span>
                                                {msg.is_internal && (
                                                    <Badge variant="outline" className="text-[9px] h-4 bg-orange-50 text-orange-600 border-orange-200 gap-1 px-1">
                                                        <Lock className="h-2 w-2" />
                                                        Internal
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className={cn(
                                                "rounded-2xl p-4 text-sm whitespace-pre-wrap",
                                                msg.sender_type === 'admin' 
                                                    ? (msg.is_internal ? "bg-orange-50 border border-orange-100 rounded-tr-none" : "bg-primary text-white rounded-tr-none")
                                                    : "bg-gray-100 text-gray-800 rounded-tl-none"
                                            )}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        </ScrollArea>

                        {/* Reply Area */}
                        <div className="p-4 border-t bg-white">
                            <div className="flex items-center gap-4 mb-3">
                                <Tabs defaultValue="public" className="w-auto" onValueChange={(v) => setIsInternal(v === 'internal')}>
                                    <TabsList className="h-8 p-1">
                                        <TabsTrigger value="public" className="text-xs h-6 px-3">Public Reply</TabsTrigger>
                                        <TabsTrigger value="internal" className="text-xs h-6 px-3 gap-1.5">
                                            <Lock className="h-3 w-3" />
                                            Internal Note
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                <div className="h-4 w-[1px] bg-gray-200" />
                                <span className="text-[10px] text-muted-foreground">
                                    {isInternal 
                                        ? "Only staff will see this note" 
                                        : "Customer will receive an email and app notification"}
                                </span>
                            </div>
                            <div className="relative">
                                <Textarea 
                                    placeholder={isInternal ? "Type internal note..." : "Type your reply..."}
                                    className={cn(
                                        "min-h-[100px] resize-none pr-12 focus-visible:ring-offset-0",
                                        isInternal ? "bg-orange-50/30 border-orange-100" : ""
                                    )}
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                            handleSend();
                                        }
                                    }}
                                />
                                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-full">
                                        <Paperclip className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                        size="icon" 
                                        className="h-8 w-8 rounded-full"
                                        disabled={!reply.trim() || addMessage.isPending}
                                        onClick={handleSend}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-2 text-[10px] text-muted-foreground text-right">
                                Press ⌘ + Enter to send
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar: Details */}
                <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-1">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Info className="h-4 w-4 text-blue-500" />
                                Ticket Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Channel</p>
                                    <p className="text-xs font-medium capitalize flex items-center gap-1.5">
                                        <Hash className="h-3 w-3" />
                                        {ticket.channel || 'Mobile App'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Category</p>
                                    <p className="text-xs font-medium capitalize flex items-center gap-1.5">
                                        <Tag className="h-3 w-3" />
                                        {ticket.category?.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2 border-t">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Customer Details</p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                            <User className="h-3.5 w-3.5 text-gray-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold truncate">{ticket.user_name}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">{ticket.user_email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground pl-10">
                                        <Phone className="h-3 w-3" />
                                        {ticket.user_phone || 'None'}
                                    </div>
                                </div>
                                <Button variant="link" className="p-0 h-auto text-[10px] text-blue-600 hover:no-underline font-semibold pl-10">
                                    View Full History
                                </Button>
                            </div>

                            {(ticket.booking_number || ticket.sub_number || ticket.pet_name) && (
                                <div className="space-y-2 pt-2 border-t">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Related To</p>
                                    {ticket.booking_number && (
                                        <div className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded-lg">
                                            <span className="text-muted-foreground">Booking</span>
                                            <span className="font-semibold text-blue-600">#{ticket.booking_number}</span>
                                        </div>
                                    )}
                                    {ticket.pet_name && (
                                        <div className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded-lg">
                                            <span className="text-muted-foreground">Pet</span>
                                            <span className="font-semibold">{ticket.pet_name}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-500" />
                                Timeline & SLA
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">SLA Deadline</span>
                                    <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-200">
                                        {ticket.sla_due_date ? format(new Date(ticket.sla_due_date), 'MMM dd, HH:mm') : 'None'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Created At</span>
                                    <span>{format(new Date(ticket.created_at), 'MMM dd, HH:mm')}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground">Last Updated</span>
                                    <span>{format(new Date(ticket.updated_at), 'MMM dd, HH:mm')}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
