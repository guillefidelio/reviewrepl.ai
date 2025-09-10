import { NextRequest } from 'next/server';
import { getPaddleInstance } from '@/lib/utils/paddle';
import { WebhookProcessor } from '@/lib/utils/paddle/webhook-processor';

/**
 * POST handler for Paddle webhook events
 * Handles real-time updates from Paddle billing system
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get('paddle-signature') || '';
  const rawRequestBody = await request.text();
  const privateKey = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET || '';

  try {
    // Validate required headers and body
    if (!signature || !rawRequestBody) {
      console.error('Missing signature or request body');
      return Response.json(
        { error: 'Missing signature from header or empty request body' },
        { status: 400 }
      );
    }

    // Validate webhook secret
    if (!privateKey) {
      console.error('Paddle webhook secret not configured');
      return Response.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Initialize Paddle instance and verify webhook
    const paddle = getPaddleInstance();
    const eventData = await paddle.webhooks.unmarshal(rawRequestBody, privateKey, signature);

    if (!eventData) {
      console.error('Failed to unmarshal webhook event');
      return Response.json(
        { error: 'Invalid webhook signature or malformed event data' },
        { status: 400 }
      );
    }

    // Process the webhook event
    const processor = new WebhookProcessor();
    await processor.processEvent(eventData);

    console.log(`Successfully processed webhook event: ${eventData.eventType}`);

    // Extract event ID if available (not all event types have a top-level id property)
    const eventId = 'id' in eventData ? (eventData as { id: string }).id : null;

    return Response.json({
      status: 200,
      eventType: eventData.eventType,
      eventId: eventId
    });

  } catch (error) {
    console.error('Webhook processing error:', error);

    // Log additional error details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return Response.json(
      { error: 'Internal server error while processing webhook' },
      { status: 500 }
    );
  }
}

/**
 * GET handler for webhook endpoint verification
 * Paddle may send GET requests to verify the endpoint
 */
export async function GET() {
  return Response.json({
    status: 'ok',
    message: 'Paddle webhook endpoint is active'
  });
}
