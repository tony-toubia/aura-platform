// app/api/debug/test-dates/route.ts
import { NextResponse } from 'next/server'

function isValidDate(dateString: any): boolean {
  if (!dateString) return false
  const date = new Date(dateString)
  return !isNaN(date.getTime())
}

export async function GET() {
  console.log('[DATE-TEST] Testing date validation...')
  
  const testDates = [
    '2024-01-15T10:30:00Z',          // Valid ISO string
    '2024-01-15T10:30:00.123Z',     // Valid with milliseconds
    null,                            // Null
    undefined,                       // Undefined
    '',                              // Empty string
    'invalid-date',                  // Invalid string
    '2024-02-30T10:30:00Z',         // Invalid date (Feb 30th doesn't exist)
    '2024-01-15',                    // Valid date only
    1704358200000,                   // Valid timestamp
    'Thu Jan 15 2024 10:30:00 GMT+0000 (UTC)', // Valid date string format
  ]
  
  const results = testDates.map((testDate, index) => {
    try {
      const isValid = isValidDate(testDate)
      let newDateResult = null
      let errorMessage = null
      
      if (isValid) {
        try {
          const date = new Date(testDate as any)
          newDateResult = date.toISOString()
        } catch (error) {
          errorMessage = error instanceof Error ? error.message : 'Date creation failed'
        }
      }
      
      return {
        index,
        input: testDate,
        inputType: typeof testDate,
        isValid,
        newDateResult,
        errorMessage
      }
    } catch (error) {
      return {
        index,
        input: testDate,
        inputType: typeof testDate,
        isValid: false,
        newDateResult: null,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  })
  
  console.log('[DATE-TEST] Test results:', results)
  
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    testResults: results,
    summary: {
      totalTests: results.length,
      validDates: results.filter(r => r.isValid).length,
      invalidDates: results.filter(r => !r.isValid).length,
      errorsEncountered: results.filter(r => r.errorMessage).length
    }
  })
}