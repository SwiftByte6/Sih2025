'use client'
import React, { useEffect, useState, useMemo } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { Twitter, Facebook, Youtube, MessageCircle, TrendingUp, AlertTriangle } from 'lucide-react'

// Mock social media data - in real implementation, this would come from APIs
const mockSocialMediaData = [
  {
    id: 1,
    platform: 'twitter',
    username: '@coastal_observer',
    content: 'High waves observed near Marine Drive. Water levels rising rapidly. #MumbaiFlood #CoastalAlert',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    engagement: { likes: 45, retweets: 12, replies: 8 },
    sentiment: 'concern',
    location: 'Mumbai, Maharashtra',
    hazard_keywords: ['high waves', 'flood', 'coastal']
  },
  {
    id: 2,
    platform: 'facebook',
    username: 'Mumbai Weather Updates',
    content: 'Cyclone warning issued for coastal areas. Residents advised to stay indoors. Heavy rainfall expected.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    engagement: { likes: 123, shares: 45, comments: 23 },
    sentiment: 'warning',
    location: 'Mumbai, Maharashtra',
    hazard_keywords: ['cyclone', 'warning', 'heavy rainfall']
  },
  {
    id: 3,
    platform: 'youtube',
    username: 'Coastal News Channel',
    content: 'BREAKING: Tsunami alert issued for coastal regions. Evacuation procedures in place.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    engagement: { views: 15420, likes: 234, comments: 67 },
    sentiment: 'urgent',
    location: 'Chennai, Tamil Nadu',
    hazard_keywords: ['tsunami', 'alert', 'evacuation']
  },
  {
    id: 4,
    platform: 'twitter',
    username: '@beach_safety',
    content: 'Erosion observed at Juhu Beach. Beach access restricted for safety. #BeachErosion #SafetyFirst',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    engagement: { likes: 28, retweets: 5, replies: 3 },
    sentiment: 'informational',
    location: 'Mumbai, Maharashtra',
    hazard_keywords: ['erosion', 'beach', 'safety']
  }
]

// NLP keyword extraction (simplified)
function extractHazardKeywords(text) {
  const hazardTerms = [
    'tsunami', 'cyclone', 'flood', 'erosion', 'pollution', 'high waves', 'storm surge',
    'swell surge', 'coastal current', 'abnormal sea', 'warning', 'alert', 'evacuation',
    'emergency', 'danger', 'hazard', 'disaster', 'coastal', 'beach', 'marine'
  ]
  
  const foundKeywords = hazardTerms.filter(term => 
    text.toLowerCase().includes(term.toLowerCase())
  )
  
  return foundKeywords
}

// Sentiment analysis (simplified)
function analyzeSentiment(text) {
  const urgentWords = ['breaking', 'urgent', 'emergency', 'evacuation', 'warning', 'alert']
  const concernWords = ['concern', 'worried', 'dangerous', 'risky', 'threat']
  const infoWords = ['update', 'information', 'observed', 'reported', 'noticed']
  
  const lowerText = text.toLowerCase()
  
  if (urgentWords.some(word => lowerText.includes(word))) return 'urgent'
  if (concernWords.some(word => lowerText.includes(word))) return 'concern'
  if (infoWords.some(word => lowerText.includes(word))) return 'informational'
  
  return 'neutral'
}

// Platform icon component
function PlatformIcon({ platform, className = "w-4 h-4" }) {
  switch (platform) {
    case 'twitter':
      return <Twitter className={className} />
    case 'facebook':
      return <Facebook className={className} />
    case 'youtube':
      return <Youtube className={className} />
    default:
      return <MessageCircle className={className} />
  }
}

// Sentiment badge component
function SentimentBadge({ sentiment }) {
  const getSentimentStyle = (sentiment) => {
    switch (sentiment) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'concern':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'informational':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSentimentStyle(sentiment)}`}>
      {sentiment}
    </span>
  )
}

// Social media post component
function SocialMediaPost({ post }) {
  const timeAgo = useMemo(() => {
    const now = new Date()
    const diff = now - post.timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return `${minutes}m ago`
  }, [post.timestamp])

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <PlatformIcon platform={post.platform} className="w-4 h-4 text-gray-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-semibold text-sm text-gray-900">{post.username}</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-500">{timeAgo}</span>
            <SentimentBadge sentiment={post.sentiment} />
          </div>
          
          <p className="text-sm text-gray-800 mb-3">{post.content}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {post.platform === 'twitter' && (
                <>
                  <span>{post.engagement.likes} likes</span>
                  <span>{post.engagement.retweets} retweets</span>
                  <span>{post.engagement.replies} replies</span>
                </>
              )}
              {post.platform === 'facebook' && (
                <>
                  <span>{post.engagement.likes} likes</span>
                  <span>{post.engagement.shares} shares</span>
                  <span>{post.engagement.comments} comments</span>
                </>
              )}
              {post.platform === 'youtube' && (
                <>
                  <span>{post.engagement.views} views</span>
                  <span>{post.engagement.likes} likes</span>
                  <span>{post.engagement.comments} comments</span>
                </>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              📍 {post.location}
            </div>
          </div>
          
          {post.hazard_keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {post.hazard_keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  #{keyword.replace(/\s+/g, '')}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main social media feed component
export default function SocialMediaFeed({ 
  filterByLocation = null, 
  filterByHazard = null,
  maxPosts = 10 
}) {
  const { t } = useI18n()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [trendingKeywords, setTrendingKeywords] = useState([])

  // Posts are already filtered by the API

  // Load posts and trending keywords from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Build query parameters
        const params = new URLSearchParams()
        if (filterByLocation) params.append('location', filterByLocation)
        if (filterByHazard) params.append('hazard', filterByHazard)
        params.append('limit', maxPosts.toString())
        
        const response = await fetch(`/api/social-media?${params}`)
        const data = await response.json()
        
        if (response.ok) {
          setPosts(data.posts || [])
          setTrendingKeywords(data.trendingKeywords || [])
        } else {
          throw new Error(data.error || 'Failed to load posts')
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Failed to load social media data:', error)
        // Fallback to mock data
        setPosts(mockSocialMediaData)
        const allKeywords = mockSocialMediaData.flatMap(post => post.hazard_keywords)
        const keywordCounts = allKeywords.reduce((acc, keyword) => {
          acc[keyword] = (acc[keyword] || 0) + 1
          return acc
        }, {})
        const trending = Object.entries(keywordCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([keyword, count]) => ({ keyword, count }))
        setTrendingKeywords(trending)
        setLoading(false)
      }
    }

    loadData()
  }, [filterByLocation, filterByHazard, maxPosts])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-4 mb-4">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Social Media Activity
        </h3>
        <div className="text-sm text-gray-500">
          {posts.length} posts
        </div>
      </div>

      {/* Trending Keywords */}
      {trendingKeywords.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Trending Keywords
          </h4>
          <div className="flex flex-wrap gap-2">
            {trendingKeywords.map(({ keyword, count }, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {keyword} ({count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No social media posts found matching your criteria.</p>
          </div>
        ) : (
          posts.map((post) => (
            <SocialMediaPost key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  )
}
