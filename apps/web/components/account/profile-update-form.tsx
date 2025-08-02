"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ProfileUpdateFormProps {
  userId: string
  initialName: string
  initialEmail: string
}

export function ProfileUpdateForm({ userId, initialName, initialEmail }: ProfileUpdateFormProps) {
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()

      // Update user metadata for name
      const { error: authError } = await supabase.auth.updateUser({
        data: { name }
      })

      if (authError) {
        throw authError
      }

      // Update email if changed
      if (email !== initialEmail) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email
        })

        if (emailError) {
          throw emailError
        }
      }

      // Update users table if it exists
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          name: name,
          email: email,
          updated_at: new Date().toISOString()
        })

      // Don't throw error if users table doesn't exist
      if (profileError && !profileError.message.includes('relation "users" does not exist')) {
        console.warn('Profile update warning:', profileError)
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      
      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error('Profile update error:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
        />
        <p className="text-xs text-gray-500">
          Changing your email will require verification.
        </p>
      </div>

      {message && (
        <div className={`p-3 rounded-md text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Update Profile
          </>
        )}
      </Button>
    </form>
  )
}