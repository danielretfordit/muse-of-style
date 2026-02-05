import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ClothingCardProps {
  image: string;
  brand: string;
  name: string;
  price: string;
  className?: string;
}

export function ClothingCard({ image, brand, name, price, className }: ClothingCardProps) {
  const [liked, setLiked] = useState(false);

  return (
    <div className={cn(
      "group relative bg-card rounded-xl sm:rounded-2xl shadow-sm overflow-hidden card-hover",
      className
    )}>
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Heart Button */}
        <button
          onClick={() => setLiked(!liked)}
          className={cn(
            "absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200",
            liked 
              ? "bg-primary text-primary-foreground" 
              : "bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-primary"
          )}
        >
          <Heart className={cn("w-3 h-3 sm:w-4 sm:h-4", liked && "fill-current")} />
        </button>
      </div>
      
      {/* Content */}
      <div className="p-2 sm:p-3">
        {brand && (
          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium mb-0.5 sm:mb-1 truncate">
            {brand}
          </p>
        )}
        <h4 className="font-body text-xs sm:text-sm text-foreground font-medium line-clamp-1 mb-0.5 sm:mb-1">
          {name}
        </h4>
        {price && (
          <p className="font-body text-xs sm:text-sm font-semibold text-primary">
            {price}
          </p>
        )}
      </div>
    </div>
  );
}