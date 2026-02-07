import { Heart, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClothingCardProps {
  image: string;
  brand: string;
  name: string;
  price: string;
  className?: string;
  isFavorite?: boolean;
  ownershipStatus?: "owned" | "saved";
  onFavoriteToggle?: () => void;
  onClick?: () => void;
}

export function ClothingCard({
  image,
  brand,
  name,
  price,
  className,
  isFavorite = false,
  ownershipStatus,
  onFavoriteToggle,
  onClick,
}: ClothingCardProps) {
  return (
    <div
      className={cn(
        "group relative bg-card rounded-xl sm:rounded-2xl shadow-sm overflow-hidden card-hover",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Saved badge */}
        {ownershipStatus === "saved" && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-card/80 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
            <Bookmark className="w-3 h-3 text-primary fill-primary" />
            <span className="text-[10px] font-medium text-foreground">Идея</span>
          </div>
        )}

        {/* Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle?.();
          }}
          className={cn(
            "absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200",
            isFavorite
              ? "bg-primary text-primary-foreground"
              : "bg-card/80 backdrop-blur-sm text-muted-foreground hover:text-primary"
          )}
        >
          <Heart className={cn("w-3 h-3 sm:w-4 sm:h-4", isFavorite && "fill-current")} />
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
