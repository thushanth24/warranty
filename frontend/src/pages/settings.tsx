import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800 rounded-2xl mb-8">
          <CardContent className="p-8 md:p-10 text-gray-900 dark:text-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Settings</h1>
            <div className="space-y-8">
              <section>
                <Label className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Account</Label>
                <div className="flex flex-col gap-4">
                  <Button variant="outline" className="w-full md:w-auto">Change Email</Button>
                  <Button variant="outline" className="w-full md:w-auto">Change Password</Button>
                </div>
              </section>
              <section>
                <Label className="block text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Preferences</Label>
                <div className="flex flex-col gap-4">
                  <Button variant="outline" className="w-full md:w-auto">Notification Settings</Button>
                  <div className="flex items-center gap-4 py-2">
  <span className="text-gray-700 dark:text-gray-200 text-base">Theme</span>
  <ThemeToggle />
</div>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
