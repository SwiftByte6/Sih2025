import { NextResponse } from 'next/server'
import { analyticsService } from '@/lib/analyticsService'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'reports'
    const dateRange = searchParams.get('dateRange') || '7d'
    const location = searchParams.get('location') || ''
    const hazardType = searchParams.get('hazardType') || ''

    const filters = {
      dateRange,
      location,
      hazardType
    }

    let analytics

    switch (type) {
      case 'reports':
        analytics = await analyticsService.getReportAnalytics(filters)
        break
      case 'social':
        analytics = await analyticsService.getSocialMediaAnalytics()
        break
      case 'combined':
        const [reportAnalytics, socialAnalytics] = await Promise.all([
          analyticsService.getReportAnalytics(filters),
          analyticsService.getSocialMediaAnalytics()
        ])
        analytics = {
          reports: reportAnalytics,
          social: socialAnalytics,
          combined: {
            totalActivity: reportAnalytics.summary.totalReports + (socialAnalytics?.totalPosts || 0),
            riskLevel: reportAnalytics.riskAssessment.level,
            trendingTopics: socialAnalytics?.trendingKeywords || [],
            insights: [
              ...reportAnalytics.insights,
              ...(socialAnalytics ? [{
                type: 'social_activity',
                priority: 'low',
                title: 'Social Media Activity',
                message: `${socialAnalytics.totalPosts} social media posts related to coastal hazards`,
                recommendation: 'Monitor social sentiment for early warning indicators'
              }] : [])
            ]
          }
        }
        break
      case 'cache':
        analytics = analyticsService.getCacheStatus()
        break
      default:
        return NextResponse.json({ error: 'Invalid analytics type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
      filters
    })

  } catch (error) {
    console.error('Analytics API error:', error)
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
    const { action } = body

    switch (action) {
      case 'clear-cache':
        analyticsService.clearCache()
        return NextResponse.json({
          success: true,
          message: 'Cache cleared successfully',
          timestamp: new Date().toISOString()
        })
      
      case 'refresh':
        const { type = 'reports', filters = {} } = body
        analyticsService.clearCache()
        const analytics = await analyticsService.getReportAnalytics(filters)
        return NextResponse.json({
          success: true,
          data: analytics,
          message: 'Data refreshed successfully',
          timestamp: new Date().toISOString()
        })
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Analytics POST error:', error)
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
