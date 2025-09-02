"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// Common job types
exports.JOB_TYPES = {
    AI_GENERATION: 'ai_generation',
    REVIEW_PROCESSING: 'review_processing',
    PROMPT_ANALYSIS: 'prompt_analysis',
    SENTIMENT_ANALYSIS: 'sentiment_analysis',
};

// For simplicity, we'll define the basic types that the worker actually uses
// The worker mainly uses JobStatus and Job interfaces
