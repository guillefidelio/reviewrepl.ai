'use client';

import { useState } from 'react';
import { useSupabaseAuth } from '@/components/auth/SupabaseAuthProvider';
import { useSupabaseBusinessProfile } from '@/lib/hooks/useSupabaseBusinessProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { generateSystemPrompt } from '@/lib/utils/systemPromptGenerator';

export default function SystemPromptDemoPage() {
  const { user } = useSupabaseAuth();
  const { data: businessProfile, loading: profileLoading } = useSupabaseBusinessProfile();
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [mode, setMode] = useState<'simple' | 'pro'>('simple');

  if (!user) {
    return (
      <div className="p-6">
        <p>Please log in to view this demo.</p>
      </div>
    );
  }

  const handleGeneratePrompt = () => {
    if (!businessProfile) return;

    const context = {
      businessProfile,
      mode,
      customPrompt: mode === 'pro' ? customPrompt : undefined,
      reviewType: mode === 'pro' ? ('positive' as const) : undefined
    };

    const systemPrompt = generateSystemPrompt(context);
    setGeneratedPrompt(systemPrompt);
  };

  const getPromptPreview = () => {
    if (!businessProfile) return 'No business profile found';
    
    const context = {
      businessProfile,
      mode,
      customPrompt: mode === 'pro' ? customPrompt : undefined,
      reviewType: mode === 'pro' ? ('positive' as const) : undefined
    };

    return generateSystemPrompt(context);
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-card-foreground">System Prompt Generation Demo</h1>
        <p className="text-muted-foreground">
          See how intelligent system prompts are generated based on business profile and mode
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Mode</label>
              <div className="flex space-x-2">
                <Button
                  variant={mode === 'simple' ? 'default' : 'outline'}
                  onClick={() => setMode('simple')}
                  size="sm"
                >
                  Simple Mode
                </Button>
                <Button
                  variant={mode === 'pro' ? 'default' : 'outline'}
                  onClick={() => setMode('pro')}
                  size="sm"
                >
                  Pro Mode
                </Button>
              </div>
            </div>

            {/* Custom Prompt for Pro Mode */}
            {mode === 'pro' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Custom Prompt</label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Enter your custom prompt instructions..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be combined with your business profile to create the final system prompt.
                </p>
              </div>
            )}

            {/* Business Profile Status */}
            <div>
              <label className="text-sm font-medium mb-2 block">Business Profile Status</label>
              {profileLoading ? (
                <Badge variant="secondary">Loading...</Badge>
              ) : businessProfile ? (
                <Badge variant="default">✓ Loaded</Badge>
              ) : (
                <Badge variant="destructive">✗ Not Found</Badge>
              )}
            </div>

            <Button 
              onClick={handleGeneratePrompt} 
              disabled={!businessProfile}
              className="w-full"
            >
              Generate System Prompt
            </Button>
          </CardContent>
        </Card>

        {/* Generated Prompt Display */}
        <Card>
          <CardHeader>
            <CardTitle>Generated System Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedPrompt ? (
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {generatedPrompt}
                  </pre>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p><strong>Mode:</strong> {mode}</p>
                  <p><strong>Length:</strong> {generatedPrompt.length} characters</p>
                  {mode === 'pro' && customPrompt && (
                    <p><strong>Custom Instructions:</strong> {customPrompt.length} characters</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>Click &quot;Generate System Prompt&quot; to see the result</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Business Profile Preview */}
      {businessProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Business Profile Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Business Name:</strong> {businessProfile.business_name}
              </div>
              <div>
                <strong>Category:</strong> {businessProfile.business_main_category}
              </div>
              <div>
                <strong>Location:</strong> {businessProfile.state_province}, {businessProfile.country}
              </div>
              <div>
                <strong>Tone:</strong> {businessProfile.response_tone}
              </div>
              <div>
                <strong>Length:</strong> {businessProfile.response_length}
              </div>
              <div>
                <strong>Language:</strong> {businessProfile.language}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <p className="text-sm text-muted-foreground">
            See how the system prompt changes as you modify the configuration
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm font-mono max-h-64 overflow-y-auto">
              {getPromptPreview()}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
