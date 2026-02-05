import { Heart, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface LookCardProps {
  image: string;
  title: string;
  stylistName: string;
  stylistAvatar: string;
  tags: string[];
  likes: number;
  className?: string;
}

export function LookCard({ 
  image, 
  title, 
  stylistName, 
  stylistAvatar, 
  tags, 
  likes,
  className 
}: LookCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className={cn(
      "group relative bg-card rounded-[20px] shadow-md overflow-hidden card-hover",
      className
    )}>
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Overlay with title */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-display text-xl text-card font-semibold mb-2">{title}</h3>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span 
                key={i}
                className="tag bg-card/20 backdrop-blur-sm text-card text-[10px]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        {/* Save Button */}
        <button
          onClick={() => setSaved(!saved)}
          className={cn(
            "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200",
            saved 
              ? "bg-primary text-primary-foreground" 
              : "bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-primary"
          )}
        >
          <Bookmark className={cn("w-4 h-4", saved && "fill-current")} />
        </button>
      </div>
      
      {/* Footer */}
      <div className="p-4 flex items-center justify-between">
        {/* Stylist Info */}
        <div className="flex items-center gap-2.5">
          <img 
            src={stylistAvatar}
            alt={stylistName}
            className="w-8 h-8 rounded-full object-cover border-2 border-secondary"
          />
          <span className="font-body text-sm text-foreground">{stylistName}</span>
        </div>
        
        {/* Likes */}
        <button 
          onClick={() => setLiked(!liked)}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
        >
          <Heart className={cn("w-4 h-4", liked && "fill-primary text-primary")} />
          <span className="font-body text-sm">{liked ? likes + 1 : likes}</span>
        </button>
      </div>
    </div>
  );
}