import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/root-lib/supabase/server';

/**
 * GET /api/workshop - List all workshops for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query
    let query = supabase
      .from('workshops')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: workshops, error } = await query;

    if (error) {
      console.error('Error fetching workshops:', error);
      return NextResponse.json(
        { error: 'Failed to fetch workshops' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      workshops,
      count: workshops.length,
      limit,
      offset,
    });

  } catch (error) {
    console.error('Workshop GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workshop - Create new workshop
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, business_name, description } = body;

    // Validate required fields
    if (!title || !business_name) {
      return NextResponse.json(
        { error: 'Title and business name are required' },
        { status: 400 }
      );
    }

    // Create workshop
    const { data: workshop, error } = await supabase
      .from('workshops')
      .insert({
        user_id: user.id,
        title,
        business_name,
        description: description || null,
        status: 'draft',
        current_module: 'gz-intake',
        data: {}, // Empty JSONB object
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating workshop:', error);
      return NextResponse.json(
        { error: 'Failed to create workshop' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { workshop },
      { status: 201 }
    );

  } catch (error) {
    console.error('Workshop POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
