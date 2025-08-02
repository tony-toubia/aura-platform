import { redirect } from "next/navigation"
import { createServerSupabase } from "@/lib/supabase/server.server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Shield, Camera, Save } from "lucide-react"
import { ProfileUpdateForm } from "@/components/account/profile-update-form"
import { PasswordChangeForm } from "@/components/account/password-change-form"
import { AvatarUpload } from "@/components/account/avatar-upload"

// Force this page to revalidate on every request to show fresh user data
export const revalidate = 0

export default async function AccountPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile data
  const { data: profile } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', user.id)
    .single()

  const userProfile = {
    id: user.id,
    email: user.email || profile?.email || '',
    name: profile?.name || '',
    avatar_url: user.user_metadata?.avatar_url || '',
    created_at: user.created_at,
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      {/* Hero */}
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-lg text-gray-600">
          Manage your profile, security, and account preferences.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Profile Information */}
        <Card className="bg-white/90 backdrop-blur-md shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and profile picture.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userProfile.avatar_url} alt={userProfile.name || 'User'} />
                <AvatarFallback className="text-2xl">
                  {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : userProfile.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <AvatarUpload userId={user.id} currentAvatarUrl={userProfile.avatar_url} />
            </div>

            {/* Profile Form */}
            <ProfileUpdateForm 
              userId={user.id}
              initialName={userProfile.name}
              initialEmail={userProfile.email}
            />
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-white/90 backdrop-blur-md shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Manage your password and security preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordChangeForm userId={user.id} />
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card className="bg-white/90 backdrop-blur-md shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            View your account details and membership information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-gray-700">User ID</Label>
              <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded border">
                {user.id}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Member Since</Label>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                {new Date(userProfile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Email Verified</Label>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                {user.email_confirmed_at ? 'Yes' : 'No'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Last Sign In</Label>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Never'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}