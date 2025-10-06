import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Users, Shield, AlertTriangle, Activity } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

export default function ChatDemoPage() {
  return (
    <MainLayout title="Chat System Demo">
      <div className="container mx-auto py-6 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Team Chat System</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A WhatsApp-style chat interface integrated with your Early Alert Network system. 
            The sidebar remains persistent, allowing seamless navigation between contacts and other system features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                <span>Real-time Messaging</span>
              </CardTitle>
              <CardDescription>
                Instant messaging with typing indicators and message status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Instant message delivery</li>
                <li>• Typing indicators</li>
                <li>• Message timestamps</li>
                <li>• Read receipts</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-500" />
                <span>Team Management</span>
              </CardTitle>
              <CardDescription>
                Organized contact lists with role-based priorities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Emergency Response Team</li>
                <li>• Security Operations</li>
                <li>• Data Collection Unit</li>
                <li>• Analysis Team</li>
                <li>• Field Coordinators</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-500" />
                <span>Priority System</span>
              </CardTitle>
              <CardDescription>
                Color-coded priority levels for different teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">High Priority (Emergency)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Medium Priority (Security)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Low Priority (Data)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Key Features</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Navigation</h4>
              <ul className="space-y-1">
                <li>• Persistent sidebar navigation</li>
                <li>• Quick access to all system modules</li>
                <li>• Mobile-responsive design</li>
                <li>• Breadcrumb navigation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Chat Features</h4>
              <ul className="space-y-1">
                <li>• Search contacts by name</li>
                <li>• Online/offline status indicators</li>
                <li>• Unread message counters</li>
                <li>• Message history persistence</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/chat">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <MessageCircle className="h-5 w-5 mr-2" />
              Launch Team Chat
            </Button>
          </Link>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Select Contact</h4>
              <p className="text-sm text-gray-600">
                Choose from the list of team contacts in the left sidebar. 
                Priority levels are color-coded for easy identification.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Start Chatting</h4>
              <p className="text-sm text-gray-600">
                Type your message and press Enter or click Send. 
                The chat interface maintains the sidebar for easy navigation.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Navigate Freely</h4>
              <p className="text-sm text-gray-600">
                Use the sidebar to switch between contacts or access other 
                system modules without losing your place in the chat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
