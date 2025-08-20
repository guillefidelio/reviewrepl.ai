'use client';

import { Download, Globe } from 'lucide-react';

export function ChromeExtensionCard() {
  return (
    <div className="bg-card overflow-hidden shadow rounded-lg border border-border">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center mb-4">
          <Globe className="h-6 w-6 text-primary mr-2" />
          <h3 className="text-lg font-medium text-card-foreground">
            Chrome Extension
          </h3>
        </div>
        
        <p className="text-muted-foreground mb-4">
          Install our Chrome extension to start generating AI replies
        </p>

        <div className="bg-muted rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-card-foreground">ReviewRepl.ai Extension</div>
              <div className="text-sm text-muted-foreground">Version 2.0.1</div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Not Installed
            </span>
          </div>
        </div>

        <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
          <Download className="h-4 w-4 mr-2" />
          Install Chrome Extension
        </button>
      </div>
    </div>
  );
}

