"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Loader2, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AvatarUploadProps {
  userId: string
  currentAvatarUrl: string
}

export function AvatarUpload({ userId, currentAvatarUrl }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be smaller than 5MB' })
      return
    }

    setIsUploading(true)
    setMessage(null)

    try {
      const supabase = createClient()

      // Create a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      })

      if (updateError) {
        throw updateError
      }

      // Delete old avatar if it exists and is not a default
      if (currentAvatarUrl && currentAvatarUrl.includes('supabase')) {
        const oldPath = currentAvatarUrl.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${oldPath}`])
        }
      }

      setMessage({ type: 'success', text: 'Avatar updated successfully!' })
      
      // Refresh the page to show updated avatar
      router.refresh()
    } catch (error) {
      console.error('Avatar upload error:', error)
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to upload avatar' 
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleFileSelect}
        disabled={isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Camera className="w-4 h-4 mr-2" />
            Change Avatar
          </>
        )}
      </Button>

      {message && (
        <div className={`p-2 rounded-md text-xs text-center ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        JPG, PNG or GIF. Max size 5MB.
      </p>
    </div>
  )
}