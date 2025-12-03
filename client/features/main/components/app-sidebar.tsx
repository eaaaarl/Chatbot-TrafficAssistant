'use client'

import React, { useState } from 'react';
import { User, BarChart3, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';

const mockChatHistory = [
  { id: 1, title: "Urban vs Rural Analysis", date: "Today", preview: "Tell me about urban accidents..." },
];

export default function TrafficSidebar() {
  const [activeChat, setActiveChat] = useState(null);

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="cursor-pointer">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <BarChart3 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Traffic Assistant</span>
                  <span className="truncate text-xs text-muted-foreground">AI Data Analysis</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-2 py-2">
          <Button className="w-full justify-start gap-2" variant="outline">
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Recent Conversations</SidebarGroupLabel>
          <SidebarMenu>
            {mockChatHistory.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton
                  onClick={() => setActiveChat(chat.id)}
                  className="w-full justify-start"
                  isActive={activeChat === chat.id}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium text-sm truncate">{chat.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{chat.preview}</div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{chat.date}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User className="w-4 h-4" />
              <div className="flex-1 overflow-hidden">
                <div className="font-medium text-sm">Earl Dominic V. Ado</div>
                <div className="text-xs text-muted-foreground">earl.ado17@gmail.com</div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}