import { supabase } from '@/lib/supabaseClient'

// Smart alerting service for automated notifications and alerts
export class AlertingService {
  constructor() {
    this.alertThresholds = {
      highRiskScore: 20,
      mediumRiskScore: 10,
      highActivityThreshold: 10, // reports in 24h
      lowVerificationRate: 50, // percentage
      highResponseTime: 24 // hours
    }
    this.alertHistory = new Map()
    this.cooldownPeriod = 60 * 60 * 1000 // 1 hour cooldown between similar alerts
  }

  // Check for alert conditions and generate alerts
  async checkAlertConditions(analytics) {
    const alerts = []
    const now = new Date()

    // Risk level alerts
    if (analytics.riskAssessment.level === 'high') {
      const alert = await this.createAlert({
        type: 'risk_level',
        severity: 'high',
        title: 'High Risk Level Detected',
        message: `Risk level is HIGH with score ${analytics.riskAssessment.score}. Immediate attention required.`,
        data: analytics.riskAssessment,
        recommendations: [
          'Issue public alerts for affected regions',
          'Activate emergency response teams',
          'Increase monitoring frequency',
          'Prepare evacuation procedures if necessary'
        ]
      })
      if (alert) alerts.push(alert)
    }

    // High activity alerts
    if (analytics.summary.recentReports > this.alertThresholds.highActivityThreshold) {
      const alert = await this.createAlert({
        type: 'high_activity',
        severity: 'medium',
        title: 'High Report Activity',
        message: `${analytics.summary.recentReports} reports in the last 24 hours - above normal levels.`,
        data: { recentReports: analytics.summary.recentReports },
        recommendations: [
          'Monitor for potential emergency situations',
          'Check for coordinated reporting patterns',
          'Verify report authenticity',
          'Prepare for increased response workload'
        ]
      })
      if (alert) alerts.push(alert)
    }

    // Low verification rate alerts
    if (analytics.summary.verificationRate < this.alertThresholds.lowVerificationRate) {
      const alert = await this.createAlert({
        type: 'low_verification',
        severity: 'medium',
        title: 'Low Verification Rate',
        message: `Verification rate is ${analytics.summary.verificationRate}% - below acceptable threshold.`,
        data: { verificationRate: analytics.summary.verificationRate },
        recommendations: [
          'Review verification process efficiency',
          'Assign additional verification staff',
          'Implement automated verification tools',
          'Check for system issues affecting verification'
        ]
      })
      if (alert) alerts.push(alert)
    }

    // Performance alerts
    if (analytics.performance.avgResponseTime > this.alertThresholds.highResponseTime) {
      const alert = await this.createAlert({
        type: 'slow_response',
        severity: 'low',
        title: 'Slow Response Time',
        message: `Average response time is ${analytics.performance.avgResponseTime} hours - above target.`,
        data: { avgResponseTime: analytics.performance.avgResponseTime },
        recommendations: [
          'Review response workflow efficiency',
          'Assign additional response staff',
          'Implement automated response triggers',
          'Optimize verification process'
        ]
      })
      if (alert) alerts.push(alert)
    }

    // Geographic concentration alerts
    const topRegion = Object.entries(analytics.geoDistribution.regions)
      .sort(([,a], [,b]) => b - a)[0]
    
    if (topRegion && topRegion[1] > analytics.summary.totalReports * 0.6) {
      const alert = await this.createAlert({
        type: 'geographic_concentration',
        severity: 'medium',
        title: 'Geographic Concentration Alert',
        message: `${topRegion[0]} has ${Math.round((topRegion[1] / analytics.summary.totalReports) * 100)}% of all reports.`,
        data: { region: topRegion[0], percentage: Math.round((topRegion[1] / analytics.summary.totalReports) * 100) },
        recommendations: [
          'Focus monitoring resources on this region',
          'Check for regional emergency situations',
          'Coordinate with local authorities',
          'Prepare for potential evacuation if needed'
        ]
      })
      if (alert) alerts.push(alert)
    }

    // Hazard type alerts
    const mostCommonHazard = Object.entries(analytics.hazardTypes)
      .sort(([,a], [,b]) => b - a)[0]
    
    if (mostCommonHazard && mostCommonHazard[1] > analytics.summary.totalReports * 0.4) {
      const alert = await this.createAlert({
        type: 'hazard_dominance',
        severity: 'medium',
        title: 'Dominant Hazard Type',
        message: `${mostCommonHazard[0].replace('_', ' ')} represents ${Math.round((mostCommonHazard[1] / analytics.summary.totalReports) * 100)}% of all reports.`,
        data: { hazardType: mostCommonHazard[0], count: mostCommonHazard[1] },
        recommendations: this.getHazardSpecificRecommendations(mostCommonHazard[0])
      })
      if (alert) alerts.push(alert)
    }

    return alerts
  }

  // Create alert with cooldown check
  async createAlert(alertData) {
    const alertKey = `${alertData.type}_${JSON.stringify(alertData.data)}`
    const now = Date.now()
    
    // Check cooldown
    if (this.alertHistory.has(alertKey)) {
      const lastAlert = this.alertHistory.get(alertKey)
      if (now - lastAlert.timestamp < this.cooldownPeriod) {
        return null // Skip due to cooldown
      }
    }

    // Create alert
    const alert = {
      id: `alert_${now}_${Math.random().toString(36).substr(2, 9)}`,
      ...alertData,
      timestamp: now,
      status: 'active',
      acknowledged: false
    }

    // Store in history
    this.alertHistory.set(alertKey, { timestamp: now, alert })

    // Store in database
    try {
      await this.storeAlert(alert)
    } catch (error) {
      console.error('Failed to store alert:', error)
    }

    return alert
  }

  // Store alert in database
  async storeAlert(alert) {
    const { error } = await supabase
      .from('system_alerts')
      .insert([{
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        data: alert.data,
        recommendations: alert.recommendations,
        status: alert.status,
        created_at: new Date(alert.timestamp).toISOString()
      }])

    if (error) throw error
  }

  // Get hazard-specific recommendations
  getHazardSpecificRecommendations(hazardType) {
    const recommendations = {
      tsunami: [
        'Activate tsunami early warning systems',
        'Issue immediate evacuation orders for coastal areas',
        'Coordinate with meteorological departments',
        'Prepare emergency response teams'
      ],
      cyclone: [
        'Monitor weather patterns and cyclone tracking',
        'Issue cyclone warnings to affected regions',
        'Prepare emergency shelters and supplies',
        'Coordinate with disaster management authorities'
      ],
      storm_surge: [
        'Monitor tide levels and storm surge predictions',
        'Issue flood warnings for low-lying areas',
        'Prepare flood response teams and equipment',
        'Coordinate with coastal protection authorities'
      ],
      high_waves: [
        'Issue marine weather warnings',
        'Advise against coastal activities',
        'Monitor wave heights and coastal conditions',
        'Prepare for potential coastal flooding'
      ],
      flood: [
        'Activate flood monitoring systems',
        'Issue flood warnings and evacuation orders',
        'Prepare flood response teams and equipment',
        'Coordinate with water management authorities'
      ],
      erosion: [
        'Assess coastal protection measures',
        'Monitor erosion rates and patterns',
        'Prepare long-term coastal management plans',
        'Coordinate with environmental protection agencies'
      ],
      pollution: [
        'Investigate pollution sources and extent',
        'Issue public health advisories',
        'Activate pollution cleanup procedures',
        'Coordinate with environmental agencies'
      ]
    }

    return recommendations[hazardType] || [
      'Continue monitoring the situation',
      'Assess potential risks and impacts',
      'Prepare appropriate response measures',
      'Coordinate with relevant authorities'
    ]
  }

  // Get active alerts
  async getActiveAlerts() {
    try {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      return []
    }
  }

  // Acknowledge alert
  async acknowledgeAlert(alertId) {
    try {
      const { error } = await supabase
        .from('system_alerts')
        .update({ 
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
      return false
    }
  }

  // Get alert statistics
  async getAlertStatistics() {
    try {
      const { data, error } = await supabase
        .from('system_alerts')
        .select('severity, status, created_at')

      if (error) throw error

      const stats = {
        total: data.length,
        active: data.filter(a => a.status === 'active').length,
        acknowledged: data.filter(a => a.status === 'acknowledged').length,
        bySeverity: {
          high: data.filter(a => a.severity === 'high').length,
          medium: data.filter(a => a.severity === 'medium').length,
          low: data.filter(a => a.severity === 'low').length
        },
        recent: data.filter(a => {
          const alertDate = new Date(a.created_at)
          const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
          return alertDate >= last24h
        }).length
      }

      return stats
    } catch (error) {
      console.error('Failed to get alert statistics:', error)
      return null
    }
  }

  // Clear old alerts
  async clearOldAlerts(daysOld = 30) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const { error } = await supabase
        .from('system_alerts')
        .delete()
        .lt('created_at', cutoffDate.toISOString())

      if (error) throw error
      return true
    } catch (error) {
      console.error('Failed to clear old alerts:', error)
      return false
    }
  }

  // Update alert thresholds
  updateThresholds(newThresholds) {
    this.alertThresholds = { ...this.alertThresholds, ...newThresholds }
  }

  // Get current thresholds
  getThresholds() {
    return { ...this.alertThresholds }
  }
}

// Export singleton instance
export const alertingService = new AlertingService()
