// lib/utils/calendar-test.ts (Helper to test the integration)
export async function testGoogleCalendarConnection(accessToken: string) {
  try {
    // Test by fetching user's calendar list
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Calendar API error: ${response.status}`)
    }

    const calendar = await response.json()
    console.log('Calendar connection test successful:', {
      id: calendar.id,
      summary: calendar.summary,
      timeZone: calendar.timeZone
    })

    // Test by fetching upcoming events
    const eventsResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?' + 
      new URLSearchParams({
        timeMin: new Date().toISOString(),
        maxResults: '5',
        singleEvents: 'true',
        orderBy: 'startTime',
      }),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (eventsResponse.ok) {
      const events = await eventsResponse.json()
      console.log(`Found ${events.items?.length || 0} upcoming events`)
      return {
        success: true,
        calendar,
        eventCount: events.items?.length || 0
      }
    }

    return { success: true, calendar }
  } catch (error) {
    console.error('Calendar connection test failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}