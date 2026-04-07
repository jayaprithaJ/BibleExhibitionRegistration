import { NextResponse } from 'next/server';
import { query } from '@/lib/db/client';

// GET all configurations
export async function GET() {
  try {
    const configs = await query<{
      id: string;
      config_key: string;
      config_value: string;
      config_type: string;
      description: string;
      category: string;
      is_editable: boolean;
      updated_at: string;
      updated_by: string;
    }>(
      `SELECT * FROM site_config ORDER BY category, config_key`
    );

    // Group by category
    const groupedConfigs: Record<string, any[]> = {};
    configs.forEach(config => {
      if (!groupedConfigs[config.category]) {
        groupedConfigs[config.category] = [];
      }
      groupedConfigs[config.category].push(config);
    });

    return NextResponse.json(
      {
        success: true,
        configs: groupedConfigs,
        allConfigs: configs,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching configs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch configurations' },
      { status: 500 }
    );
  }
}

// PUT update configuration
export async function PUT(request: Request) {
  try {
    const { config_key, config_value, updated_by } = await request.json();

    if (!config_key || config_value === undefined) {
      return NextResponse.json(
        { success: false, error: 'config_key and config_value are required' },
        { status: 400 }
      );
    }

    // Update the configuration
    await query(
      `UPDATE site_config 
       SET config_value = $1, 
           updated_at = NOW(),
           updated_by = $2
       WHERE config_key = $3 AND is_editable = true`,
      [config_value, updated_by || 'admin', config_key]
    );

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
    });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}

// Made with Bob
