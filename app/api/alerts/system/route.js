import { NextResponse } from 'next/server'
import { alertingService } from '@/lib/alertingService'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'

    switch (action) {
      case 'list':
        const alerts = await alertingService.getActiveAlerts()
        return NextResponse.json({
          success: true,
          data: alerts,
          timestamp: new Date().toISOString()
        })

      case 'statistics':
        const stats = await alertingService.getAlertStatistics()
        return NextResponse.json({
          success: true,
          data: stats,
          timestamp: new Date().toISOString()
        })

      case 'thresholds':
        const thresholds = alertingService.getThresholds()
        return NextResponse.json({
          success: true,
          data: thresholds,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('System alerts API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'acknowledge':
        const { alertId } = data
        if (!alertId) {
          return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 })
        }
        
        const acknowledged = await alertingService.acknowledgeAlert(alertId)
        return NextResponse.json({
          success: acknowledged,
          message: acknowledged ? 'Alert acknowledged successfully' : 'Failed to acknowledge alert',
          timestamp: new Date().toISOString()
        })

      case 'update-thresholds':
        const { thresholds } = data
        if (!thresholds || typeof thresholds !== 'object') {
          return NextResponse.json({ error: 'Valid thresholds object is required' }, { status: 400 })
        }
        
        alertingService.updateThresholds(thresholds)
        return NextResponse.json({
          success: true,
          message: 'Thresholds updated successfully',
          data: alertingService.getThresholds(),
          timestamp: new Date().toISOString()
        })

      case 'clear-old':
        const { daysOld = 30 } = data
        const cleared = await alertingService.clearOldAlerts(daysOld)
        return NextResponse.json({
          success: cleared,
          message: cleared ? 'Old alerts cleared successfully' : 'Failed to clear old alerts',
          timestamp: new Date().toISOString()
        })

      case 'check-conditions':
        const { analytics } = data
        if (!analytics) {
          return NextResponse.json({ error: 'Analytics data is required' }, { status: 400 })
        }
        
        const newAlerts = await alertingService.checkAlertConditions(analytics)
        return NextResponse.json({
          success: true,
          data: newAlerts,
          message: `${newAlerts.length} new alerts generated`,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('System alerts POST error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}
