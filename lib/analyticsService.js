import { supabase } from '@/lib/supabaseClient'

// Analytics service for automated data processing and insights
export class AnalyticsService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
  }

  // Get cached data or fetch fresh data
  async getCachedData(key, fetchFunction) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    
    const data = await fetchFunction()
    this.cache.set(key, { data, timestamp: Date.now() })
    return data
  }

  // Automated report analytics
  async getReportAnalytics(filters = {}) {
    return this.getCachedData('report-analytics', async () => {
      const { data: reports, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000)

      if (error) throw error

      const analytics = this.processReportData(reports, filters)
      return analytics
    })
  }

  // Process report data for insights
  processReportData(reports, filters) {
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Filter reports based on criteria
    let filteredReports = reports
    if (filters.dateRange) {
      const cutoff = new Date(now.getTime() - this.getDateRangeMs(filters.dateRange))
      filteredReports = filteredReports.filter(r => new Date(r.created_at) >= cutoff)
    }

    // Calculate metrics
    const totalReports = filteredReports.length
    const verifiedReports = filteredReports.filter(r => r.status === 'verified').length
    const pendingReports = filteredReports.filter(r => r.status === 'pending').length
    const recentReports = filteredReports.filter(r => new Date(r.created_at) >= last24h).length

    // Hazard type distribution
    const hazardTypes = filteredReports.reduce((acc, report) => {
      acc[report.type] = (acc[report.type] || 0) + 1
      return acc
    }, {})

    // Geographic distribution
    const geoDistribution = this.calculateGeoDistribution(filteredReports)

    // Time-based trends
    const timeTrends = this.calculateTimeTrends(filteredReports)

    // Risk assessment
    const riskAssessment = this.assessRiskLevel(filteredReports, hazardTypes)

    // Performance metrics
    const performance = this.calculatePerformanceMetrics(filteredReports)

    return {
      summary: {
        totalReports,
        verifiedReports,
        pendingReports,
        recentReports,
        verificationRate: totalReports > 0 ? Math.round((verifiedReports / totalReports) * 100) : 0
      },
      hazardTypes,
      geoDistribution,
      timeTrends,
      riskAssessment,
      performance,
      insights: this.generateInsights(filteredReports, hazardTypes, riskAssessment)
    }
  }

  // Calculate geographic distribution
  calculateGeoDistribution(reports) {
    const regions = {}
    const coordinates = []

    reports.forEach(report => {
      if (report.latitude && report.longitude) {
        coordinates.push({ lat: report.latitude, lng: report.longitude })
        
        // Simple region mapping based on coordinates
        const region = this.getRegionFromCoordinates(report.latitude, report.longitude)
        regions[region] = (regions[region] || 0) + 1
      }
    })

    return { regions, coordinates, totalWithLocation: coordinates.length }
  }

  // Get region from coordinates (simplified mapping)
  getRegionFromCoordinates(lat, lng) {
    if (lat >= 19 && lat <= 20 && lng >= 72 && lng <= 73) return 'Mumbai'
    if (lat >= 12 && lat <= 14 && lng >= 79 && lng <= 81) return 'Chennai'
    if (lat >= 22 && lat <= 23 && lng >= 88 && lng <= 89) return 'Kolkata'
    if (lat >= 9 && lat <= 10 && lng >= 76 && lng <= 77) return 'Kochi'
    return 'Other'
  }

  // Calculate time-based trends
  calculateTimeTrends(reports) {
    const now = new Date()
    const last7Days = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const dayReports = reports.filter(r => {
        const reportDate = new Date(r.created_at)
        return reportDate >= dayStart && reportDate < dayEnd
      })
      
      last7Days.push({
        date: dayStart.toISOString().split('T')[0],
        count: dayReports.length,
        verified: dayReports.filter(r => r.status === 'verified').length
      })
    }

    return { last7Days }
  }

  // Assess risk level based on reports
  assessRiskLevel(reports, hazardTypes) {
    const riskFactors = {
      high: ['tsunami', 'cyclone', 'storm_surge'],
      medium: ['high_waves', 'flood', 'erosion'],
      low: ['pollution', 'abnormal_sea_behavior']
    }

    let riskScore = 0
    let riskLevel = 'low'

    Object.entries(hazardTypes).forEach(([type, count]) => {
      if (riskFactors.high.includes(type)) {
        riskScore += count * 3
      } else if (riskFactors.medium.includes(type)) {
        riskScore += count * 2
      } else {
        riskScore += count * 1
      }
    })

    // Recent activity multiplier
    const recentReports = reports.filter(r => {
      const reportDate = new Date(r.created_at)
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return reportDate >= last24h
    }).length

    riskScore += recentReports * 2

    if (riskScore >= 20) riskLevel = 'high'
    else if (riskScore >= 10) riskLevel = 'medium'

    return {
      level: riskLevel,
      score: riskScore,
      factors: {
        highRiskTypes: Object.entries(hazardTypes).filter(([type]) => riskFactors.high.includes(type)),
        recentActivity: recentReports,
        totalReports: reports.length
      }
    }
  }

  // Calculate performance metrics
  calculatePerformanceMetrics(reports) {
    const now = new Date()
    const avgResponseTime = this.calculateAvgResponseTime(reports)
    const verificationRate = this.calculateVerificationRate(reports)
    const dataQuality = this.calculateDataQuality(reports)

    return {
      avgResponseTime,
      verificationRate,
      dataQuality,
      totalReports: reports.length,
      lastUpdated: now.toISOString()
    }
  }

  // Calculate average response time for verification
  calculateAvgResponseTime(reports) {
    const verifiedReports = reports.filter(r => r.status === 'verified' && r.updated_at)
    if (verifiedReports.length === 0) return 0

    const totalTime = verifiedReports.reduce((sum, report) => {
      const created = new Date(report.created_at)
      const updated = new Date(report.updated_at)
      return sum + (updated.getTime() - created.getTime())
    }, 0)

    return Math.round(totalTime / verifiedReports.length / (1000 * 60 * 60)) // hours
  }

  // Calculate verification rate
  calculateVerificationRate(reports) {
    const verified = reports.filter(r => r.status === 'verified').length
    return reports.length > 0 ? Math.round((verified / reports.length) * 100) : 0
  }

  // Calculate data quality score
  calculateDataQuality(reports) {
    let qualityScore = 0
    const totalReports = reports.length

    if (totalReports === 0) return 0

    reports.forEach(report => {
      let score = 0
      if (report.title && report.title.length > 10) score += 1
      if (report.description && report.description.length > 20) score += 1
      if (report.latitude && report.longitude) score += 1
      if (report.image_url) score += 1
      if (report.type) score += 1
      
      qualityScore += (score / 5) * 100
    })

    return Math.round(qualityScore / totalReports)
  }

  // Generate automated insights
  generateInsights(reports, hazardTypes, riskAssessment) {
    const insights = []

    // Most common hazard insight
    const mostCommon = Object.entries(hazardTypes).sort(([,a], [,b]) => b - a)[0]
    if (mostCommon) {
      insights.push({
        type: 'hazard_trend',
        priority: 'medium',
        title: 'Most Reported Hazard',
        message: `${mostCommon[0].replace('_', ' ')} is the most reported hazard type with ${mostCommon[1]} reports`,
        recommendation: this.getHazardRecommendation(mostCommon[0])
      })
    }

    // Risk level insight
    if (riskAssessment.level === 'high') {
      insights.push({
        type: 'risk_alert',
        priority: 'high',
        title: 'High Risk Alert',
        message: 'Current risk level is HIGH based on recent reports and hazard types',
        recommendation: 'Consider issuing public alerts and increasing monitoring'
      })
    }

    // Recent activity insight
    const recentReports = reports.filter(r => {
      const reportDate = new Date(r.created_at)
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return reportDate >= last24h
    }).length

    if (recentReports > 10) {
      insights.push({
        type: 'activity_spike',
        priority: 'medium',
        title: 'High Activity Detected',
        message: `${recentReports} reports in the last 24 hours - above normal levels`,
        recommendation: 'Monitor for potential emergency situations'
      })
    }

    // Geographic concentration insight
    const geoDistribution = this.calculateGeoDistribution(reports)
    const topRegion = Object.entries(geoDistribution.regions).sort(([,a], [,b]) => b - a)[0]
    if (topRegion && topRegion[1] > reports.length * 0.4) {
      insights.push({
        type: 'geographic_concentration',
        priority: 'low',
        title: 'Geographic Concentration',
        message: `${topRegion[0]} has ${Math.round((topRegion[1] / reports.length) * 100)}% of all reports`,
        recommendation: 'Consider focused monitoring in this region'
      })
    }

    return insights
  }

  // Get hazard-specific recommendations
  getHazardRecommendation(hazardType) {
    const recommendations = {
      tsunami: 'Implement early warning systems and evacuation procedures',
      cyclone: 'Monitor weather patterns and prepare emergency response teams',
      storm_surge: 'Check coastal infrastructure and issue flood warnings',
      high_waves: 'Advise coastal activities and monitor wave heights',
      flood: 'Activate flood response protocols and monitor water levels',
      erosion: 'Assess coastal protection measures and long-term planning',
      pollution: 'Investigate pollution sources and implement cleanup measures'
    }
    return recommendations[hazardType] || 'Continue monitoring and assess situation'
  }

  // Get date range in milliseconds
  getDateRangeMs(range) {
    const ranges = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000
    }
    return ranges[range] || ranges['7d']
  }

  // Social media analytics
  async getSocialMediaAnalytics() {
    return this.getCachedData('social-analytics', async () => {
      try {
        const response = await fetch('/api/social-media?limit=100')
        const data = await response.json()
        
        return {
          totalPosts: data.totalPosts,
          trendingKeywords: data.trendingKeywords,
          sentimentDistribution: data.sentimentDistribution,
          platformDistribution: this.calculatePlatformDistribution(data.posts),
          engagementMetrics: this.calculateEngagementMetrics(data.posts)
        }
      } catch (error) {
        console.error('Social media analytics error:', error)
        return null
      }
    })
  }

  // Calculate platform distribution
  calculatePlatformDistribution(posts) {
    return posts.reduce((acc, post) => {
      acc[post.platform] = (acc[post.platform] || 0) + 1
      return acc
    }, {})
  }

  // Calculate engagement metrics
  calculateEngagementMetrics(posts) {
    const totalEngagement = posts.reduce((sum, post) => {
      const engagement = post.engagement
      return sum + (engagement.likes || 0) + (engagement.shares || 0) + (engagement.comments || 0) + (engagement.retweets || 0)
    }, 0)

    return {
      totalEngagement,
      avgEngagement: posts.length > 0 ? Math.round(totalEngagement / posts.length) : 0,
      topEngagedPost: posts.reduce((max, post) => {
        const engagement = (post.engagement.likes || 0) + (post.engagement.shares || 0) + (post.engagement.comments || 0)
        const maxEngagement = (max.engagement.likes || 0) + (max.engagement.shares || 0) + (max.engagement.comments || 0)
        return engagement > maxEngagement ? post : max
      }, posts[0] || {})
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear()
  }

  // Get cache status
  getCacheStatus() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp
      }))
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService()
