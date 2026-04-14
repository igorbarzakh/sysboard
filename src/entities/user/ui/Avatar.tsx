"use client";

import Image from "next/image";

const SIZE_CLASSES = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
} as const;

const AVATAR_COLORS = [
  { bg: "#FFF3CC", text: "#A07800" },
  { bg: "#CCFAE8", text: "#0A7A50" },
  { bg: "#D5E8FF", text: "#1A55CC" },
  { bg: "#FFE4CC", text: "#CC5C00" },
  { bg: "#FFD5D5", text: "#CC2020" },
  { bg: "#EDD5FF", text: "#7020CC" },
];

interface AvatarProps {
  name: string | null;
  image: string | null;
  size?: keyof typeof SIZE_CLASSES;
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getColorIndex(name: string | null): number {
  if (!name) return 0;
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return hash % AVATAR_COLORS.length;
}

export function Avatar({ name, image, size = "md" }: AvatarProps) {
  const sizeClass = SIZE_CLASSES[size];
  const baseClass = `relative ${sizeClass} rounded-full shrink-0 flex items-center justify-center overflow-hidden`;

  if (image) {
    return (
      <div className={baseClass}>
        <Image src={image} alt={name ?? "User avatar"} fill className="object-cover" />
      </div>
    );
  }

  const color = AVATAR_COLORS[getColorIndex(name)];

  return (
    <div
      className={`${baseClass} font-semibold leading-none select-none`}
      style={{ backgroundColor: color.bg, color: color.text }}>
      {getInitials(name)}
    </div>
  );
}
