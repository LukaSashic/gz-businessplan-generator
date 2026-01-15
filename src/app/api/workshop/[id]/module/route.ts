import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/root-lib/supabase/server';

/**
 * POST /api/workshop/[id]/module - Save module progress
 *
 * Updates the workshop's data JSONB field with module-specific data
 */
export async function POST(
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
    const { module_name, module_data, update_current_module } = body;

    // Validate required fields
    if (!module_name || !module_data) {
      return NextResponse.json(
        { error: 'module_name and module_data are required' },
        { status: 400 }
      );
    }

    // First, fetch current workshop data
    const { data: workshop, error: fetchError } = await supabase
      .from('workshops')
      .select('data')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !workshop) {
      return NextResponse.json(
        { error: 'Workshop not found' },
        { status: 404 }
      );
    }

    // Merge new module data with existing data
    const currentData = workshop.data || {};
    const updatedData = {
      ...currentData,
      [module_name]: {
        ...(currentData[module_name] || {}),
        ...module_data,
        last_updated: new Date().toISOString(),
      },
    };

    // Build update object
    const updates: any = {
      data: updatedData,
    };

    // Optionally update current_module pointer
    if (update_current_module) {
      updates.current_module = module_name;
    }

    // Update workshop
    const { data: updatedWorkshop, error: updateError } = await supabase
      .from('workshops')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError || !updatedWorkshop) {
      console.error('Error updating module progress:', updateError);
      return NextResponse.json(
        { error: 'Failed to save module progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      workshop: updatedWorkshop,
      module_name,
      message: 'Module progress saved successfully',
    });
  } catch (error) {
    console.error('Module progress POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/workshop/[id]/module?name=gz-intake - Get specific module data
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

    // Get module name from query params
    const { searchParams } = new URL(request.url);
    const moduleName = searchParams.get('name');

    if (!moduleName) {
      return NextResponse.json(
        { error: 'module name query parameter is required' },
        { status: 400 }
      );
    }

    // Fetch workshop
    const { data: workshop, error } = await supabase
      .from('workshops')
      .select('data')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !workshop) {
      return NextResponse.json(
        { error: 'Workshop not found' },
        { status: 404 }
      );
    }

    // Extract module data
    const moduleData = workshop.data?.[moduleName] || null;

    return NextResponse.json({
      module_name: moduleName,
      module_data: moduleData,
    });
  } catch (error) {
    console.error('Module GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
