import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/root-lib/supabase/server';

/**
 * GET /api/workshop/[id] - Get single workshop
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch workshop
    const { data: workshop, error } = await supabase
      .from('workshops')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !workshop) {
      return NextResponse.json(
        { error: 'Workshop not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ workshop });
  } catch (error) {
    console.error('Workshop GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/workshop/[id] - Update workshop
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { title, business_name, description, status, current_module, data } =
      body;

    // Validate status if provided (must match database constraint)
    const validStatuses = ['draft', 'in_progress', 'completed', 'archived'];
    if (status !== undefined && !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Build update object (only include provided fields)
    const updates: any = {};

    if (title !== undefined) updates.title = title;
    if (business_name !== undefined) updates.business_name = business_name;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (current_module !== undefined) updates.current_module = current_module;
    if (data !== undefined) updates.data = data;

    // Update workshop
    const { data: workshop, error } = await supabase
      .from('workshops')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !workshop) {
      console.error('Error updating workshop:', error);
      return NextResponse.json(
        { error: 'Failed to update workshop' },
        { status: error?.code === 'PGRST116' ? 404 : 500 }
      );
    }

    return NextResponse.json({ workshop });
  } catch (error) {
    console.error('Workshop PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workshop/[id] - Delete workshop
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Authenticate
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete workshop
    const { error } = await supabase
      .from('workshops')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting workshop:', error);
      return NextResponse.json(
        { error: 'Failed to delete workshop' },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }

    return NextResponse.json(
      { message: 'Workshop deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Workshop DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
