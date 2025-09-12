import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function getSupabaseServerClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
      set(name, value, options) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name, options) {
        cookieStore.set({ name, value: '', ...options })
      },
    },
  })
}

// Mock social media data - in production, this would integrate with actual APIs
const mockSocialMediaData = [
  {
    id: 1,
    platform: 'twitter',
    username: '@coastal_observer',
    content: 'High waves observed near Marine Drive. Water levels rising rapidly. #MumbaiFlood #CoastalAlert',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    engagement: { likes: 45, retweets: 12, replies: 8 },
    sentiment: 'concern',
    location: 'Mumbai, Maharashtra',
    hazard_keywords: ['high waves', 'flood', 'coastal'],
    coordinates: { lat: 19.0760, lng: 72.8777 }
  },
  {
    id: 2,
    platform: 'facebook',
    username: 'Mumbai Weather Updates',
    content: 'Cyclone warning issued for coastal areas. Residents advised to stay indoors. Heavy rainfall expected.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 123, shares: 45, comments: 23 },
    sentiment: 'warning',
    location: 'Mumbai, Maharashtra',
    hazard_keywords: ['cyclone', 'warning', 'heavy rainfall'],
    coordinates: { lat: 19.0760, lng: 72.8777 }
  },
  {
    id: 3,
    platform: 'youtube',
    username: 'Coastal News Channel',
    content: 'BREAKING: Tsunami alert issued for coastal regions. Evacuation procedures in place.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    engagement: { views: 15420, likes: 234, comments: 67 },
    sentiment: 'urgent',
    location: 'Chennai, Tamil Nadu',
    hazard_keywords: ['tsunami', 'alert', 'evacuation'],
    coordinates: { lat: 13.0827, lng: 80.2707 }
  },
  {
    id: 4,
    platform: 'twitter',
    username: '@beach_safety',
    content: 'Erosion observed at Juhu Beach. Beach access restricted for safety. #BeachErosion #SafetyFirst',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 28, retweets: 5, replies: 3 },
    sentiment: 'informational',
    location: 'Mumbai, Maharashtra',
    hazard_keywords: ['erosion', 'beach', 'safety'],
    coordinates: { lat: 19.1077, lng: 72.8262 }
  },
  {
    id: 5,
    platform: 'facebook',
    username: 'Kerala Coastal Watch',
    content: 'Storm surge warning for Kerala coast. Fishermen advised not to venture into sea.',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    engagement: { likes: 67, shares: 23, comments: 12 },
    sentiment: 'warning',
    location: 'Kochi, Kerala',
    hazard_keywords: ['storm surge', 'warning', 'fishermen'],
    coordinates: { lat: 9.9312, lng: 76.2673 }
  }
]

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const hazard = searchParams.get('hazard')
    const platform = searchParams.get('platform')
    const limit = parseInt(searchParams.get('limit')) || 50

    let filteredData = mockSocialMediaData

    // Apply filters
    if (location) {
      filteredData = filteredData.filter(post => 
        post.location.toLowerCase().includes(location.toLowerCase())
      )
    }

    if (hazard) {
      filteredData = filteredData.filter(post => 
        post.hazard_keywords.some(keyword => 
          keyword.toLowerCase().includes(hazard.toLowerCase())
        )
      )
    }

    if (platform) {
      filteredData = filteredData.filter(post => 
        post.platform === platform
      )
    }

    // Limit results
    filteredData = filteredData.slice(0, limit)

    // Calculate trending keywords
    const allKeywords = mockSocialMediaData.flatMap(post => post.hazard_keywords)
    const keywordCounts = allKeywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1
      return acc
    }, {})

    const trendingKeywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }))

    // Calculate sentiment distribution
    const sentimentCounts = mockSocialMediaData.reduce((acc, post) => {
      acc[post.sentiment] = (acc[post.sentiment] || 0) + 1
      return acc
    }, {})

    return new Response(JSON.stringify({ 
      posts: filteredData,
      trendingKeywords,
      sentimentDistribution: sentimentCounts,
      totalPosts: mockSocialMediaData.length,
      filteredCount: filteredData.length
    }), {
      headers: { 'content-type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { platform, username, content, location, coordinates } = body

    // In a real implementation, this would:
    // 1. Validate the social media post data
    // 2. Process the content with NLP
    // 3. Extract hazard keywords
    // 4. Analyze sentiment
    // 5. Store in database
    // 6. Trigger real-time updates

    const newPost = {
      id: Date.now(),
      platform,
      username,
      content,
      timestamp: new Date().toISOString(),
      engagement: { likes: 0, shares: 0, comments: 0 },
      sentiment: 'neutral',
      location,
      hazard_keywords: [],
      coordinates
    }

    return new Response(JSON.stringify({ 
      success: true, 
      post: newPost 
    }), {
      headers: { 'content-type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
