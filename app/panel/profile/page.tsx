"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Check } from "lucide-react";

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export default function ProfilePage() {
  const [name, setName] = useState("Luka Nesic");
  const [phone, setPhone] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Edit Profile</h1>
        <p className="text-sm text-zinc-500 mt-1">Update your personal information and profile photo.</p>
      </div>

      <div className="space-y-8">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="size-20">
              {avatarPreview && <AvatarImage src={avatarPreview} alt={name} className="object-cover" />}
              <AvatarFallback className="text-xl font-semibold">{initials(name) || "?"}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-semibold text-zinc-900">{name || "—"}</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 text-xs text-indigo-600 hover:underline"
            >
              Change photo
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-5">
          <div className="grid gap-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              defaultValue="lukannesic@gmail.com"
              disabled
              className="opacity-60 cursor-not-allowed"
            />
            <p className="text-xs text-zinc-400">Email cannot be changed here.</p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+41 ..."
            />
          </div>
        </div>

        {/* Save */}
        <Button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl shadow-md shadow-indigo-100"
        >
          {saved ? <><Check className="w-4 h-4 mr-2" /> Saved</> : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
